// 60b-baker: the B1 baker (browser). Turns character outfits (12a-12f) and enemy rigs (13, 11)
// into cached canvases. Pixels are made at ART resolution (1 art px) and every frame canvas is
// drawn at 2x (PX), so 1 art px = 2 CSS px on the stage. Rules: docs/design/art-direction.md.
//
// Render passes (rasterize): per-piece masks, 3 tones from the piece's own volume (light from the
// top left), cast shadow under a piece that sits on top, section lines (the under-piece's line
// colour where another piece sits on it), despeckle, then a 1 art px ink outline.
//
// Exposed: charFrames, heroSpec, classPreviewSpec, companionSpec, portraitURL, drawCharPreview,
//          charLightPass, enemyFrames, bakeStats, idleTask, ART (also bake, bakeSet, resolve, rasterize, PX)
// Frame sets are lazy: a frame bakes on first use or while the page is idle (lazySet).
//
// Frame: { c: canvas (2x), ox, oy, lights, anchor, art }. Feet at (ox, oy) in canvas px (= CSS px).
//   lights: [{ x, y (canvas px), rgb: 'r,g,b', pulse, size (CSS px), r (glow radius, CSS px) }]
//   anchor: { hx, hy, hw, hh } head centre and radii in ART px from the feet (characters only).
//   art: the 1x canvas; artOx / artOy its feet.
// Character specs (plain JSON, hashable):
//   hero:      { cls, skin: 0-2 | '#hex', hair: 0-3 | '#hex', gear: { weapon|off|head|body|charm: { t: 1-5, r: 0-3, glow?: '#hex' } } }
//   companion: { comp: key, t?: 1-5, r?: 0-3 }   (t / r override the role weapon's tier and rarity)

const ART = (() => {
  const PX = 2;
  const { INK, ramp3, m, mix, gearMats, SKINS, HAIRS, CLASSES, CHARS, ANIMS, DOWN, makeKit, mapShape, shapeBox, rotP, hueShift } = AK;
  const RAR_IDX = { common: 0, uncommon: 1, rare: 1, epic: 2, legendary: 3 };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const stats = { bakes: 0, ms: 0, last: {} };
  const hexNum = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const norm3 = (x, y, z) => { const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };

  // ================= rasterizer (pure maths on typed arrays) =================
  const L = norm3(-.55, -.62, .58), TH = [.84, .36], BEV = 1.3;
  const FLATK = { glow: 1, flat: 1 };
  const FLATTEN = { cloth: .72, leather: .82, metal: 1.05, skin: .4, hair: .85, wood: .8, stone: .92, slime: 1, gem: 1 };
  const rampCache = new Map();
  const rampFor = mt => {
    const key = mt.hex + mt.kind + (mt.line || ''); let r = rampCache.get(key);
    if (!r) { r = FLATK[mt.kind] ? { c: [mt.hex, mt.hex, mt.hex], line: mt.line || mix(mt.hex, '#000000', .45), ol: INK, flat: 1 } : ramp3(mt.hex, mt.kind); rampCache.set(key, r); }
    return r;
  };
  const TMP = [0, 0, 1];
  function insideN(s, x, y, wantN) {
    if (s.t === 'e') { const co = Math.cos(-s.a), si = Math.sin(-s.a), dx = x - s.cx, dy = y - s.cy; const lx = (dx * co - dy * si) / s.rx, ly = (dx * si + dy * co) / s.ry, rr = lx * lx + ly * ly; if (rr > 1) return false; if (wantN) { const c2 = Math.cos(s.a), s2 = Math.sin(s.a); TMP[0] = lx * c2 - ly * s2; TMP[1] = lx * s2 + ly * c2; TMP[2] = Math.sqrt(Math.max(0, 1 - rr)); } return true; }
    if (s.t === 'c') { const dx = s.x2 - s.x1, dy = s.y2 - s.y1, L2 = dx * dx + dy * dy; let t = L2 ? ((x - s.x1) * dx + (y - s.y1) * dy) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; const px = s.x1 + dx * t, py = s.y1 + dy * t, r = s.r1 + (s.r2 - s.r1) * t; const ox = x - px, oy = y - py, d2 = ox * ox + oy * oy; if (d2 > r * r) return false; if (wantN) { TMP[0] = ox / r; TMP[1] = oy / r; TMP[2] = Math.sqrt(Math.max(0, 1 - d2 / (r * r))); } return true; }
    if (s.t === 'p') { let c = false; const p = s.pts; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) { const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
    return false;
  }
  // parts: [{ z, ord, m: material, s: shape (art px, feet at 0,0), o: options }] -> image data at art px.
  // Returns { W, H, ox, oy, data: Uint8ClampedArray RGBA, lights: [{ x, y (from feet, art px), rgb, r, pulse, n }] }
  function rasterize(parts, opt = {}) {
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
    for (const p of parts) { const b = shapeBox(p.s); if (b[0] < bx0) bx0 = b[0]; if (b[1] < by0) by0 = b[1]; if (b[2] > bx1) bx1 = b[2]; if (b[3] > by1) by1 = b[3]; }
    const ox = 2 - Math.floor(bx0), oy = 2 - Math.floor(by0);
    const W = Math.max(4, Math.ceil(bx1) + ox + 3), H = Math.max(4, Math.ceil(by1) + oy + 3);
    const N = W * H, pid = new Int16Array(N).fill(-1), tone = new Int8Array(N);
    const list = parts.slice().sort((a, b) => a.z - b.z || a.ord - b.ord);
    list.forEach((p, i) => { p.rank = i; p.ramp = rampFor(p.m); });
    const lights = [];
    for (const p of list) {
      const s = p.s; const [a, b, c, d] = shapeBox(s);
      const x0 = Math.max(0, Math.floor(a + ox) - 1), y0 = Math.max(0, Math.floor(b + oy) - 1), x1 = Math.min(W - 1, Math.ceil(c + ox) + 1), y1 = Math.min(H - 1, Math.ceil(d + oy) + 1);
      if (x1 < x0 || y1 < y0) { p.r = null; continue; }
      const w = x1 - x0 + 1, h = y1 - y0 + 1, mk = new Uint8Array(w * h), NN = new Float32Array(w * h * 3);
      const analytic = (s.t === 'e' || s.t === 'c') && !p.o.flat;
      const cl = p.o.clip && p.o.clip.r;
      const qx = s.t === 'q' ? Math.round(s.x + ox) : 0, qy = s.t === 'q' ? Math.round(s.y + oy) : 0;
      let cnt = 0, sx = 0, sy = 0;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const gx = x0 + i, gy = y0 + j; let inn;
        if (s.t === 'q') inn = gx >= qx && gx < qx + s.w && gy >= qy && gy < qy + s.h;
        else inn = insideN(s, gx - ox + .5, gy - oy + .5, analytic);
        if (inn && p.o.clip) { if (!cl) inn = false; else { const ci = gx - cl.x0, cj = gy - cl.y0; inn = ci >= 0 && cj >= 0 && ci < cl.w && cj < cl.h && cl.m[cj * cl.w + ci] === 1; } }
        if (!inn) continue;
        const k = j * w + i; mk[k] = 1; cnt++; sx += gx; sy += gy;
        if (analytic) { NN[k * 3] = TMP[0]; NN[k * 3 + 1] = TMP[1]; NN[k * 3 + 2] = TMP[2]; }
      }
      p.r = { x0, y0, w, h, m: mk, N: NN };
      if (!cnt) continue;
      if (p.m.kind === 'glow' && !p.o.nolight) lights.push({ x: sx / cnt - ox + .5, y: sy / cnt - oy + .5, rgb: AK.rgbOf(p.m.light || p.m.hex), r: p.o.lr || Math.max(6, Math.sqrt(cnt) * 3.2), pulse: !!p.o.pulse, n: cnt });
      if (!analytic && !FLATK[p.m.kind] && !p.o.flat) {
        if (cl && p.o.pn !== false) { // share the parent's volume so trims and emblems shade with it
          for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const k = j * w + i; if (!mk[k]) continue; const ci = x0 + i - cl.x0, cj = y0 + j - cl.y0, ck = (cj * cl.w + ci) * 3; NN[k * 3] = cl.N[ck]; NN[k * 3 + 1] = cl.N[ck + 1]; NN[k * 3 + 2] = cl.N[ck + 2]; }
        } else {
          // bevel: distance to the piece's edge -> a rounded height field -> normals
          const Dt = new Float32Array(w * h), BIG = 1e6;
          for (let k = 0; k < w * h; k++) Dt[k] = mk[k] ? BIG : 0;
          const at = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? 0 : Dt[j * w + i];
          for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const k = j * w + i; if (!mk[k]) continue; Dt[k] = Math.min(Dt[k], at(i - 1, j) + 1, at(i, j - 1) + 1, at(i - 1, j - 1) + 1.414, at(i + 1, j - 1) + 1.414); }
          for (let j = h - 1; j >= 0; j--) for (let i = w - 1; i >= 0; i--) { const k = j * w + i; if (!mk[k]) continue; Dt[k] = Math.min(Dt[k], at(i + 1, j) + 1, at(i, j + 1) + 1, at(i + 1, j + 1) + 1.414, at(i - 1, j + 1) + 1.414); }
          const Rb = BEV * (p.o.bev || 1), Hh = new Float32Array(w * h);
          for (let k = 0; k < w * h; k++) { if (!mk[k]) continue; const dd = Math.min(Dt[k] - .5, Rb); Hh[k] = Math.sqrt(Math.max(0, Rb * Rb - (Rb - dd) * (Rb - dd))); }
          const hv = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? 0 : Hh[j * w + i];
          for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const k = j * w + i; if (!mk[k]) continue; const gx = (hv(i + 1, j) - hv(i - 1, j)) / 2, gy = (hv(i, j + 1) - hv(i, j - 1)) / 2; const n = norm3(-gx, -gy, 1); NN[k * 3] = n[0]; NN[k * 3 + 1] = n[1]; NN[k * 3 + 2] = n[2]; }
        }
      }
      // tones: 0 highlight, 1 base, 2 shade
      const flat = FLATK[p.m.kind] || p.o.flat, fl = FLATTEN[p.m.kind] || .8, met = p.m.kind === 'metal' || p.m.kind === 'gem' || p.m.kind === 'slime';
      const shift = p.o.tone || 0;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const k = j * w + i; if (!mk[k]) continue;
        const gi = (y0 + j) * W + x0 + i; pid[gi] = p.rank;
        if (flat) { tone[gi] = 1; continue; }
        const nx = NN[k * 3] * fl, ny = NN[k * 3 + 1] * fl, nz = NN[k * 3 + 2]; const l = Math.hypot(nx, ny, nz) || 1;
        let v = (nx * L[0] + ny * L[1] + nz * L[2]) / l;
        if (met) v = (v - .5) * 1.4 + .5;
        const t = v > TH[0] ? 0 : v > TH[1] ? 1 : 2;
        tone[gi] = Math.max(0, Math.min(2, t + shift));
      }
    }
    // cast shadow: one step darker directly under (and down-right of) a piece that sits on top
    const t2 = tone.slice();
    const sameG = (a, b) => a.o.g && a.o.g === b.o.g;
    for (let y = 1; y < H; y++) for (let x = 1; x < W; x++) {
      const i = y * W + x, a = pid[i]; if (a < 0) continue; const A = list[a]; if (A.ramp.flat) continue;
      for (const j of [i - W, i - W - 1]) { const b = pid[j]; if (b > a) { const B = list[b]; if (!B.o.ns && !B.o.nl && !sameG(A, B) && B.s.t !== 'q') { t2[i] = Math.min(2, tone[i] + 1); break; } } }
    }
    // section lines: where a piece sits on top of another, the pixel underneath takes the
    // under-piece's line colour (a dark of its own material). This is what separates sections.
    const line = new Uint8Array(N);
    if (!opt.noLines) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, a = pid[i]; if (a < 0) continue; const A = list[a]; if (A.o.nlu) continue;
      const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1];
      for (const j of nb) { if (j < 0) continue; const b = pid[j]; if (b > a) { const B = list[b]; if (B.o.nl || sameG(A, B)) continue; if (B.m.hex === A.m.hex && B.m.kind === A.m.kind && !B.o.sep) continue; line[i] = 1; break; } }
    }
    const out = new Array(N);
    for (let i = 0; i < N; i++) if (pid[i] >= 0) { const A = list[pid[i]]; out[i] = line[i] ? A.ramp.line : A.ramp.c[t2[i]]; }
    // despeckle: a pixel with no same-coloured neighbour (8-way) takes the most common 4-way neighbour colour
    for (let pass = 0; pass < 2; pass++) for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x; if (pid[i] < 0) continue; const A = list[pid[i]]; if (A.ramp.flat || A.s.t === 'q') continue;
      let same = 0; for (const j of [i - 1, i + 1, i - W, i + W, i - W - 1, i - W + 1, i + W - 1, i + W + 1]) if (out[j] === out[i]) { same = 1; break; }
      if (same) continue; const cnt = {}; let best = null, bc = 0;
      for (const j of [i - 1, i + 1, i - W, i + W]) { if (pid[j] < 0 || list[pid[j]].ramp.flat) continue; const c2 = out[j]; cnt[c2] = (cnt[c2] || 0) + 1; if (cnt[c2] > bc) { bc = cnt[c2]; best = c2; } }
      if (best && bc >= 2) out[i] = best;
    }
    // ink outline, 1 art px, 4-way
    const data = new Uint8ClampedArray(N * 4), cache = {};
    const put = (i, hex) => { let v = cache[hex]; if (!v) v = cache[hex] = hexNum(hex); data[i * 4] = v[0]; data[i * 4 + 1] = v[1]; data[i * 4 + 2] = v[2]; data[i * 4 + 3] = 255; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (pid[i] >= 0) { put(i, out[i]); continue; }
      if (opt.noOutline) continue;
      if ((x + 1 < W && pid[i + 1] >= 0) || (y + 1 < H && pid[i + W] >= 0) || (x > 0 && pid[i - 1] >= 0) || (y > 0 && pid[i - W] >= 0)) put(i, opt.ink || INK);
    }
    return { W, H, ox, oy, data, lights };
  }

  // ================= canvases =================
  function toCanvas(r) {
    const a = document.createElement('canvas'); a.width = r.W; a.height = r.H;
    a.getContext('2d').putImageData(new ImageData(r.data, r.W, r.H), 0, 0);
    const c = document.createElement('canvas'); c.width = r.W * PX; c.height = r.H * PX;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(a, 0, 0, c.width, c.height);
    const lights = r.lights.map(l => ({ x: (r.ox + l.x) * PX, y: (r.oy + l.y) * PX, rgb: l.rgb, pulse: l.pulse, size: Math.max(2, Math.sqrt(l.n) * PX), r: l.r * 1.4 }));
    return { c, ox: r.ox * PX, oy: r.oy * PX, lights, art: a, artOx: r.ox, artOy: r.oy };
  }
  // White-flash copy of a frame (hit reaction).
  function flash(f) {
    const c = document.createElement('canvas'); c.width = f.c.width; c.height = f.c.height;
    const g = c.getContext('2d'); g.drawImage(f.c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#FFF6EA'; g.fillRect(0, 0, c.width, c.height);
    return Object.assign({}, f, { c });
  }

  // ================= characters =================
  const colOf = (v, list) => typeof v === 'string' ? v : list[Math.max(0, Math.min(list.length - 1, v | 0))];
  // spec -> { def, kind: 'hero'|'comp', g (hero gear sets) | w (role weapon set), look }
  function resolve(spec) {
    if (!spec) return null;
    if (spec.comp) {
      const def = CHARS[spec.comp]; if (!def) return null;
      const wp = def.wpn || { fam: 'ore', t: 1, r: 0 };
      const w = gearMats(wp, spec.t || wp.t, spec.r != null ? spec.r : wp.r, wp.glow);
      return { def, kind: 'comp', w };
    }
    const def = CLASSES[spec.cls] || CLASSES.warden;
    const gs = spec.gear || {}, g = {};
    for (const s of ['weapon', 'off', 'head', 'body', 'charm']) { const st = gs[s]; g[s] = st && st.t ? gearMats(def.slots[s] || { fam: 'ore' }, st.t, st.r, st.glow) : null; }
    const look = { skin: m(colOf(spec.skin == null ? 0 : spec.skin, SKINS), 'skin'), hair: m(colOf(spec.hair == null ? 0 : spec.hair, HAIRS), 'hair') };
    return { def, kind: 'hero', g, look };
  }
  function framePose(def, f) {
    const pose = {};
    if (f === 'idle1') pose.bob = 1;
    if (f === 'wind' || f === 'strike') Object.assign(pose, (ANIMS[def.anim] || ANIMS.slash)[f === 'wind' ? 'wind' : 'strike']);
    if (f === 'down') Object.assign(pose, DOWN);
    else if (def.pose) for (const k in def.pose) pose[k] = (pose[k] || 0) + def.pose[k];
    return pose;
  }
  function buildParts(rs, pose) {
    const k = makeKit(rs.def, pose);
    if (rs.kind === 'comp') rs.def.build(k, rs.w); else rs.def.build(k, rs.g, rs.look);
    let parts = k.parts;
    if (pose.fall) { // lay the figure on the ground
      let y1 = -1e9; for (const p of parts) y1 = Math.max(y1, shapeBox(p.s)[3]);
      parts = parts.map(p => Object.assign({}, p, { s: mapShape(p.s, (x, y) => [x, y - y1 + .2], 0) }));
    }
    return { parts, k };
  }
  function bakeChar(rs, f) {
    const t0 = now();
    const pose = framePose(rs.def, f), { parts, k } = buildParts(rs, pose);
    const fr = toCanvas(rasterize(parts));
    fr.anchor = { hx: k.hx, hy: k.hy, hw: k.hw, hh: k.hh };
    stats.bakes++; stats.ms += now() - t0;
    return fr;
  }
  // ---------------- lazy frame sets ----------------
  // A set bakes its `now` frames at once; the others (and `hit`, the flash of idle0) are getters
  // that bake on first use. queueRest() also queues them to bake while the page is idle. So a new
  // party member, foe or zone costs one or two frames of baking in the frame that needs it, not five
  // or six, and a portrait costs one.
  const idleQ = [];
  let idleArmed = false;
  function idleRun(dl) {
    idleArmed = false;
    const t0 = now();
    let n = 0;
    while (idleQ.length) {
      const left = dl && dl.timeRemaining ? dl.timeRemaining() : 12 - (now() - t0);
      if (left < 4 && !(n === 0 && (!dl || dl.didTimeout))) break; // a timed-out callback still does one task
      n++;
      const fn = idleQ.shift();
      try { fn(); } catch (e) { console.error('[lanternfall] idle bake', e); }
    }
    if (idleQ.length) idleArm();
  }
  function idleArm() {
    if (idleArmed) return; idleArmed = true;
    if (typeof requestIdleCallback === 'function') requestIdleCallback(idleRun, { timeout: 1500 });
    else setTimeout(idleRun, 80);
  }
  // idleTask(fn): run fn when the page is idle (small tasks; a few per idle period, in order).
  function idleTask(fn) { idleQ.push(fn); if (typeof document !== 'undefined') idleArm(); }
  function lazySet(names, nowNames, bakeOne) {
    const set = {};
    Object.defineProperty(set, '_queued', { value: false, writable: true, enumerable: false });
    const def = (name, fn) => Object.defineProperty(set, name, {
      configurable: true, enumerable: true,
      get() { const v = fn(); Object.defineProperty(set, name, { value: v, writable: true, enumerable: true, configurable: true }); return v; }
    });
    for (const f of names) def(f, () => bakeOne(f));
    if (names.includes('idle0')) def('hit', () => flash(set.idle0));
    for (const f of nowNames) if (names.includes(f)) void set[f];
    return set;
  }
  // Queue a lazy set's unbaked frames for idle time (once per set).
  function queueRest(set) {
    if (!set || set._queued !== false) return set;
    set._queued = true;
    for (const f of Object.keys(set)) { const d = Object.getOwnPropertyDescriptor(set, f); if (d && d.get) idleTask(() => void set[f]); }
    return set;
  }

  // Bake the named frames of a resolved character. Frames: idle0, idle1, wind, strike, down (+ hit from idle0).
  // lazy: bake idle0 and idle1 now ('lite': idle0 only), the rest on first use (see lazySet).
  function bakeSet(rs, names, lazy) {
    const t0 = now();
    const list = names || ['idle0', 'idle1', 'wind', 'strike', 'down'];
    let set;
    if (lazy) set = lazySet(list, lazy === 'lite' ? ['idle0'] : ['idle0', 'idle1'], f => bakeChar(rs, f));
    else {
      set = {};
      for (const f of list) set[f] = bakeChar(rs, f);
      if (set.idle0) set.hit = flash(set.idle0);
    }
    set.ms = now() - t0;
    return set;
  }

  // ---------------- caches ----------------
  const MAX_SETS = 64;
  const setCache = new Map();
  const cacheGet = k => { const v = setCache.get(k); if (v) { setCache.delete(k); setCache.set(k, v); } return v; };
  const cachePut = (k, v) => { setCache.set(k, v); while (setCache.size > MAX_SETS) setCache.delete(setCache.keys().next().value); return v; };
  const hashOf = spec => JSON.stringify(spec);
  // charFrames(spec) -> { idle0, idle1, wind, strike, hit, down }; cached by spec hash. Frames past
  // idle0/idle1 bake on first use or in idle time. lite (portraits): bake idle0 only and queue nothing.
  function charFrames(spec, lite) {
    const k = 'c' + hashOf(spec), hit = cacheGet(k); if (hit) return lite ? hit : queueRest(hit);
    const rs = resolve(spec); if (!rs) return null;
    const set = bakeSet(rs, null, lite ? 'lite' : true);
    stats.last[spec.comp || spec.cls || '?'] = Math.round(set.ms * 10) / 10;
    return cachePut(k, lite ? set : queueRest(set));
  }

  // ---------------- specs from game state ----------------
  function heroSpec() {
    const st = typeof S !== 'undefined' && S ? S : null;
    const party = st && st.party || {}, cls = CLASSES[party.cls] ? party.cls : 'warden';
    const slotOf = id => {
      const it = st && st.equip && st.equip[id] != null && typeof itemById === 'function' ? itemById(st.equip[id]) : null;
      if (!it) return null;
      const u = it.u && typeof UNIQ !== 'undefined' ? UNIQ[it.u] : null;
      const o = { t: Math.max(1, Math.min(5, it.t | 0 || 1)), r: u ? 3 : (RAR_IDX[it.r] || 0) };
      if (u && u.col) o.glow = u.col;
      return o;
    };
    const gear = { weapon: slotOf('weapon') || { t: 1, r: 0 }, off: { t: 1, r: 0 }, body: { t: 1, r: 0 } };
    const h = slotOf('helm'); if (h) gear.head = h;
    const c = slotOf('charm'); if (c) gear.charm = c;
    const spec = { cls, gear };
    if (party.skin != null) spec.skin = party.skin;
    if (party.hair != null) spec.hair = party.hair;
    return spec;
  }
  // Creation screen: the class in its base look (tier 1 Common weapon, off-hand, head and body).
  function classPreviewSpec(cls, opt) {
    const T1 = () => ({ t: 1, r: 0 });
    const spec = { cls: CLASSES[cls] ? cls : 'warden', gear: { weapon: T1(), off: T1(), head: T1(), body: T1() } };
    if (opt && opt.skin != null) spec.skin = opt.skin;
    if (opt && opt.hair != null) spec.hair = opt.hair;
    return spec;
  }
  function companionSpec(key, opt) {
    const spec = { comp: CHARS[key] ? key : 'tobin' };
    if (opt && opt.t) spec.t = opt.t;
    if (opt && opt.r != null) spec.r = opt.r;
    return spec;
  }

  // ---------------- portraits and previews ----------------
  // Portrait: a 16 x 16 art px crop around the head of the idle frame, returned at 1x as a data URL.
  // Show it at 32, 48 or 64 CSS px (image-rendering: pixelated) so every art px stays square.
  const PORT = 16;
  const portraitCache = new Map();
  function portraitCanvas(spec) {
    const set = charFrames(spec, true); if (!set) return null;
    const f = set.idle0, a = f.anchor;
    const hx = f.artOx + a.hx, hy = f.artOy + a.hy;
    const x0 = Math.round(hx - PORT / 2), y0 = Math.round(hy - PORT * .44);
    const c = document.createElement('canvas'); c.width = PORT; c.height = PORT;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(f.art, x0, y0, PORT, PORT, 0, 0, PORT, PORT);
    return c;
  }
  function portraitURL(key) {
    const spec = key && typeof key === 'object' ? key : key === 'hero' ? heroSpec() : companionSpec(key);
    const k = hashOf(spec); if (portraitCache.has(k)) return portraitCache.get(k);
    const c = portraitCanvas(spec); if (!c) return '';
    let url = ''; try { url = c.toDataURL(); } catch (e) { url = ''; }
    if (portraitCache.size > 64) portraitCache.delete(portraitCache.keys().next().value);
    portraitCache.set(k, url);
    return url;
  }
  const reducedMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  // Additive glow for a frame's lights, already mapped to the target context (x, y, r in its px).
  function charLightPass(g, lights, T, zoom) {
    const red = reducedMotion(), z = zoom || 1;
    g.save(); g.globalCompositeOperation = 'lighter';
    const flick = red ? 0.9 : 0.85 + 0.15 * Math.sin(T * 13) * Math.sin(T * 7.3);
    for (const l of lights) {
      const pulse = l.pulse && !red ? 0.8 + 0.3 * Math.sin(T * 4) : 1;
      const r = (l.r ? l.r * .55 * z : Math.max(8, l.size * 3)) * flick * pulse;
      for (const [rr, a, rgb] of [[r, 0.3 * pulse, l.rgb], [r * 0.3, 0.14 * pulse, '255,250,230']]) {
        const gr = g.createRadialGradient(l.x, l.y, 0.5, l.x, l.y, rr);
        gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(0.35, `rgba(${rgb},${a * 0.35})`); gr.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = gr; g.fillRect(l.x - rr, l.y - rr, rr * 2, rr * 2);
      }
    }
    g.restore();
  }
  // Draw a character centred with feet near the bottom of the canvas (canvas px), plus its lights.
  // zoom multiplies the stage size (zoom 1 = 2 canvas px per art px, as on the stage).
  function drawCharPreview(canvas, spec, zoom, frame, T) {
    const set = charFrames(spec); if (!set) return null;
    const f = set[frame || 'idle0'] || set.idle0, z = zoom || 1, g = canvas.getContext('2d');
    g.clearRect(0, 0, canvas.width, canvas.height);
    const x = Math.round(canvas.width / 2 - f.ox * z), y = Math.round(canvas.height - 3 * PX * z - f.oy * z);
    g.imageSmoothingEnabled = false; g.drawImage(f.c, x, y, f.c.width * z, f.c.height * z);
    charLightPass(g, f.lights.map(l => ({ x: x + l.x * z, y: y + l.y * z, rgb: l.rgb, pulse: l.pulse, size: l.size * z, r: l.r })), T || 0, z);
    return f;
  }

  // ================= enemies and gather nodes (13-art-enemies.js, 11-art-craft.js) =================
  // The rigs keep their old format (authored at 1 art px = 1 CSS px). They are converted to kit
  // pieces at half scale and rendered by the same passes, so they get B1's chunky 2x pixels,
  // 3 tones, section lines and ink outline. Rig: { parts, mats?, metal?, piv?, parent?, ground?,
  // poses: { idle0, idle1, wind, strike }, S?, flip?, variants?: { name: partial rig }, swap? }
  // or a function (variant) -> rig. variant: a variants key, or { hue, S, elder, tier, gen, ... }.
  const OLD_FIXED = { void: ['#07050B', 'flat'], gold: ['#E0AE44', 'metal'], iron: ['#7C8290', 'metal'], eye: ['#1A1420', 'flat'], bone: ['#D8CFB8', 'cloth'], leather: ['#6E4A30', 'leather'], silver: ['#B8BCC8', 'metal'] };
  const rgbHex = s => '#' + s.split(',').map(v => (+v).toString(16).padStart(2, '0')).join('');
  const enemySrc = () => typeof ENEMY_RIGS !== 'undefined' ? ENEMY_RIGS : null;
  function oldTx(pose, rig) {
    const piv = rig.piv || {}, parent = rig.parent || {}, ground = rig.ground || ['legs'];
    const boneTx = (bone, x, y, depth) => {
      const b = pose[bone];
      if (b && typeof b === 'object') {
        const pv = piv[bone] || [0, 0];
        if (b.rot) { const dx = x - pv[0], dy = y - pv[1], c = Math.cos(b.rot), s = Math.sin(b.rot); x = pv[0] + dx * c - dy * s; y = pv[1] + dx * s + dy * c; }
        x += b.dx || 0; y += b.dy || 0;
      }
      const par = parent[bone];
      return par && depth < 8 ? boneTx(par, x, y, depth + 1) : [x, y];
    };
    return (bone, x, y) => {
      const q = boneTx(bone, x, y, 0); x = q[0]; y = q[1];
      if (!ground.includes(bone)) { y += pose.up || 0; x += pose.lean || 0; }
      return [x + (pose.dx || 0), y];
    };
  }
  // old shape -> polygon points in rig space (ellipses sampled; smooth polygons curved like the old quadratic path)
  function oldPts(s) {
    if (s[0] === 'e') { const o = []; const n = Math.max(10, Math.min(24, Math.round((s[3] + s[4]) * 2.2))); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push(s[1] + Math.cos(a) * s[3], s[2] + Math.sin(a) * s[4]); } return o; }
    if (s[0] === 'r') return [s[1], s[2], s[1] + s[3], s[2], s[1] + s[3], s[2] + s[4], s[1], s[2] + s[4]];
    const q = s.slice(2); if (!s[1]) return q;
    const n = q.length / 2, o = [];
    const mid = i => { const a = (i + n) % n, b = (i + 1) % n; return [(q[a * 2] + q[b * 2]) / 2, (q[a * 2 + 1] + q[b * 2 + 1]) / 2]; };
    for (let i = 0; i < n; i++) {
      const p0 = mid(i - 1), c = [q[i * 2], q[i * 2 + 1]], p1 = mid(i);
      for (const t of [0, .34, .67]) { const u = 1 - t; o.push(u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]); }
    }
    return o;
  }
  function enemyFrames(key, variant) {
    const src = enemySrc(); if (!src || !src[key]) return null;
    const ck = 'e' + key + '|' + hashOf(variant == null ? null : variant), hit = cacheGet(ck); if (hit) return hit;
    const t0 = now();
    let rig = typeof src[key] === 'function' ? src[key](variant) : src[key];
    if (rig && rig.b1) { // B1 rigs (13-art-enemies.js): kit pieces at art px, already posed
      const set = {};
      for (const f of ['idle0', 'idle1', 'wind', 'strike']) { set[f] = toCanvas(rasterize(rig.parts(f, variant && typeof variant === 'object' ? variant : {}))); stats.bakes++; }
      set.hit = flash(set.idle0);
      set.ms = now() - t0; stats.ms += set.ms;
      stats.last['enemy:' + key] = Math.round(set.ms * 10) / 10;
      return cachePut(ck, set);
    }
    if (!rig || !rig.parts) return null;
    const vk = typeof variant === 'string' ? variant : variant && variant.elder ? 'elder' : null;
    if (vk && rig.variants && rig.variants[vk]) {
      const v = rig.variants[vk], vS = (rig.S || 1) * (v.S || 1);
      rig = Object.assign({}, rig, v, { parts: rig.parts.concat(v.parts || []), mats: Object.assign({}, rig.mats, v.mats) });
      rig.S = vS;
    }
    const hue = variant && typeof variant === 'object' && variant.hue ? variant.hue : 0;
    const scale = (rig.S || 1) * (variant && typeof variant === 'object' && variant.S ? variant.S : 1) / PX;
    const mcache = {};
    const metal = k => rig.metal && rig.metal.includes && rig.metal.includes(k);
    const matOf = k => {
      if (mcache[k]) return mcache[k];
      let v = rig.mats && rig.mats[k] != null ? rig.mats[k] : null, res;
      if (typeof v === 'string') res = m(hue ? hueShift(v, hue) : v, metal(k) ? 'metal' : 'cloth');
      else if (Array.isArray(v)) res = m(hue ? hueShift(v[1], hue) : v[1], metal(k) ? 'metal' : 'cloth');
      else if (v && v.emit) { const e = hue ? hueShift(v.emit, hue) : v.emit; res = v.light ? m(e, 'glow', { light: hue ? hueShift(rgbHex(v.light), hue) : rgbHex(v.light) }) : m(e, 'flat'); }
      else { const f = OLD_FIXED[k] || OLD_FIXED.void; res = m(f[0], f[1]); }
      return (mcache[k] = res);
    };
    const bakeOne = f => {
      const t1 = now();
      const pose = Object.assign({}, (rig.poses && (rig.poses[f] || rig.poses.idle0)) || {});
      const list = pose.drawn && rig.swap ? rig.parts.filter(p => !rig.swap.rest.includes(p)).concat(rig.swap.drawn) : rig.parts;
      const tx = oldTx(pose, rig), sx = scale * (rig.flip ? -1 : 1);
      const parts = [];
      list.forEach((p, i) => {
        if (p[4] && !(variant && variant.rar >= p[4])) return;
        const pts = oldPts(p[3]), o = [];
        for (let j = 0; j < pts.length; j += 2) { const q = tx(p[1], pts[j], pts[j + 1]); o.push(q[0] * sx, q[1] * scale); }
        let s = { t: 'p', pts: o };
        const mt = matOf(p[2]), b = shapeBox(s), w = b[2] - b[0], h = b[3] - b[1];
        // tiny pieces (eyes, sparkles) would vanish at half scale: stamp them as whole pixels
        if (w < 1.3 || h < 1.3) s = { t: 'q', x: Math.round((b[0] + b[2]) / 2 - .5), y: Math.round((b[1] + b[3]) / 2 - .5), w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
        const small = FLATK[mt.kind] && w * h < 6;
        parts.push({ z: p[0], ord: i, m: mt, s, o: small || s.t === 'q' ? { nl: 1, lr: 7 } : { bev: .9 } });
      });
      const fr = toCanvas(rasterize(parts));
      stats.bakes++; stats.ms += now() - t1;
      return fr;
    };
    // idle0 now; idle1, wind, strike and hit on first use or when idle (lazySet)
    const set = queueRest(lazySet(['idle0', 'idle1', 'wind', 'strike'], ['idle0'], bakeOne));
    set.ms = now() - t0;
    stats.last['enemy:' + key] = Math.round(set.ms * 10) / 10;
    return cachePut(ck, set);
  }

  const bakeStats = () => ({ bakes: stats.bakes, totalMs: Math.round(stats.ms), perSet: Object.assign({}, stats.last), cached: setCache.size });

  return { PX, rasterize, toCanvas, bakeSet, bake: bakeChar, idleTask, charFrames, heroSpec, classPreviewSpec, companionSpec, portraitURL, portraitCanvas, drawCharPreview, charLightPass, enemyFrames, bakeStats, resolve };
})();
const { charFrames, heroSpec, classPreviewSpec, companionSpec, portraitURL, drawCharPreview, charLightPass, enemyFrames, bakeStats } = ART;
const bake = ART.bake, bakeSet = ART.bakeSet, idleTask = ART.idleTask;
