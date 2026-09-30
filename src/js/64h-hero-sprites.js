// 64h-hero-sprites: the hand-drawn hero art for Wren, Tobin and Pip on the stage (task HEROART1,
// docs/design/art-pipeline.md). Browser-only. Data: 21y-data-heroart.js (HERO_ART, made by tools/heroart.mjs).
//
// Each pose is a 224x192 canvas with the feet on the anchor (96, 132), decoded once into a canvas cropped to the
// pose's box. Everything that moves is code, ported from art/heroes/<hero>/animate.py (the approved animations,
// art/viewer/hero-animations.html): breathing (the rows above y 118 drop 1 px), Wren's bow string (over the body,
// under the drawing forearm; straight after the release), her arrow, sound waves and bat; Tobin's sword swoosh and
// block spark; Pip's staff fire (a noise heat field on a 9-colour ramp, a rounded bowl, sparks), fire bolt, embers
// and smoke. Pip's staff flame is live: it runs on the stage clock over every pose (bright in fights, dim at camp,
// out when she has fallen). Effect sprites are made once per shape and cached; a frame is a few drawImage calls.
// Scale: 1 art px = 1 logical stage px (62-stage's layout unit; the stage zoom keeps pixels whole).
// Reduced motion: no breathing bob, the bat holds still, the flame changes shape twice a second.
//
// API:
//   heroArtId() -> 'wren' | 'tobin' | 'pip' | null   the hero on the stage (SOLO1's soloHero(), else the class:
//                                                     Ranger -> wren, Warden -> tobin, Lanternmage -> pip)
//   heroArtDraw(g, id, state, t, x, y, opts) -> info | null
//        state: fightIdle | attack | ability | campIdle | hurt | death | block (Tobin's parry); t: seconds into the
//        state (loops wrap, one-shots hold their last frame); x, y: the feet (logical px); opts: { frame (a fixed
//        frame index), flameT (the stage clock for Pip's flame, default t), alpha }.
//        info = { frame, n, done, x0, y0, f: { c, ox, oy, lights } } (x0, y0: where the pose canvas was drawn).
//   heroArtStates(id) -> { state: { n, ms, loop, hit } }   frame counts and timings (the viewer's)
//   heroArtStage(g, a, x, alpha) -> bool   62-stage's one hook in drawActor: draws the hero actor `a` (its st, flash,
//        down read as attack, hurt and death; gathering shows the camp idle), sets a._x, a._y, a._f like a baked frame
//        (Pip's flame is a light, so the key light follows her staff). False = draw the old sprite.
//   heroArtDecode(id, pose) -> { x0, y0, w, h, idx }   (checks) the palette indices of one pose
//   heroArtPreview(cv, id) -> bool   the camp pose, feet at the bottom centre of the canvas (the hero picker and the camp switch; W1-D)
//   heroArtPortraitURL(id) -> data URL of a 28x28 crop of the camp pose's head (the header portrait; 1 art px = 1 CSS px)
var heroArtId, heroArtDraw, heroArtStates, heroArtStage, heroArtDecode, heroArtPortraitURL, heroArtPreview;
{
  const D = typeof HERO_ART !== 'undefined' ? HERO_ART : null;
  const AX = 96, AY = 132, CUT = 118;
  const red = () => typeof reduced !== 'undefined' && reduced;
  const CLS_ART = { ranger: 'wren', warden: 'tobin', lanternmage: 'pip' };

  heroArtId = () => {
    if (!D) return null;
    const s = typeof soloHero === 'function' ? soloHero() : null;
    if (s) return D.heroes[s] ? s : null;
    const c = typeof S !== 'undefined' && S && S.party && S.party.cls;
    return (c && CLS_ART[c]) || null;
  };

  // ================= decoding =================
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const B64I = new Int16Array(128).fill(-1); for (let i = 0; i < 64; i++) B64I[B64.charCodeAt(i)] = i;
  function unb64(s) {
    const n = s.length, out = new Uint8Array(Math.floor(n * 3 / 4) - (s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0));
    let o = 0;
    for (let i = 0; i < n; i += 4) {
      const a = B64I[s.charCodeAt(i)], b = B64I[s.charCodeAt(i + 1)], c = B64I[s.charCodeAt(i + 2)], d = B64I[s.charCodeAt(i + 3)];
      const v = (a << 18) | (b << 12) | ((c < 0 ? 0 : c) << 6) | (d < 0 ? 0 : d);
      if (o < out.length) out[o++] = v >> 16 & 255; if (o < out.length) out[o++] = v >> 8 & 255; if (o < out.length) out[o++] = v & 255;
    }
    return out;
  }
  function unrle(rec) {
    const [x0, y0, w, h, b64] = rec, bytes = unb64(b64), idx = new Uint8Array(w * h);
    let p = 0;
    for (let i = 0; i < bytes.length && p < idx.length; i++) {
      const b = bytes[i], k = b & 63, c = b >> 6, n = c < 3 ? c + 1 : bytes[++i] + 4;
      idx.fill(k, p, Math.min(idx.length, p + n)); p += n;
    }
    return { x0, y0, w, h, idx, full: p === w * h };
  }
  heroArtDecode = (id, pose) => {
    const H = D && D.heroes[id]; if (!H) return null;
    const rec = H.poses[pose] || H.fx[pose]; return rec ? unrle(rec) : null;
  };
  const palOf = id => { const s = D.heroes[id].pal, out = []; for (let i = 0; i < s.length; i += 6) { const v = parseInt(s.slice(i, i + 6), 16); out.push([v >> 16 & 255, v >> 8 & 255, v & 255]); } return out; };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };
  // RGBA bytes -> canvas
  function toCanvas(w, h, buf) {
    const c = mk(w, h), g = c.getContext('2d');
    let img = null;
    try { img = new ImageData(buf, w, h); } catch (e) { img = g.createImageData ? g.createImageData(w, h) : null; if (img && img.data) img.data.set(buf); }
    if (img) g.putImageData(img, 0, 0);
    return c;
  }
  function idxCanvas(d, pal) {
    const buf = new Uint8ClampedArray(d.w * d.h * 4);
    for (let i = 0; i < d.idx.length; i++) { const k = d.idx[i]; if (!k) continue; const c = pal[k - 1]; buf[i * 4] = c[0]; buf[i * 4 + 1] = c[1]; buf[i * 4 + 2] = c[2]; buf[i * 4 + 3] = 255; }
    return toCanvas(d.w, d.h, buf);
  }
  // Pixel painter for effect sprites: put(x, y, [r, g, b]) into a w x h buffer, then one canvas.
  function paint(w, h, fn) {
    const buf = new Uint8ClampedArray(w * h * 4);
    const put = (x, y, c) => { x = Math.trunc(x); y = Math.trunc(y); if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255; };
    fn(put);
    return toCanvas(w, h, buf);
  }

  // Poses, decoded once per hero on first use: { x0, y0, w, h, c }.
  const SETS = {};
  function set(id) {
    let s = SETS[id]; if (s) return s;
    const H = D.heroes[id], pal = palOf(id); s = { poses: {}, fx: {} };
    for (const k of Object.keys(H.poses)) { const d = unrle(H.poses[k]); s.poses[k] = { x0: d.x0, y0: d.y0, w: d.w, h: d.h, c: idxCanvas(d, pal), d }; }
    for (const k of Object.keys(H.fx)) { const d = unrle(H.fx[k]); s.fx[k] = { w: d.w, h: d.h, c: idxCanvas(d, pal) }; }
    for (const k of Object.keys(s.poses)) delete s.poses[k].d;
    // the art's widest reach left of the anchor (Wren's bat now flits at her top right, inside the poses)
    s.left = AX - Math.min(...Object.values(s.poses).map(p => p.x0));
    SETS[id] = s;
    return s;
  }

  // ================= code effects (ported from animate.py) =================
  // value noise with a fixed seed (the shapes of fire): smooth, repeatable, no tables
  const hash = (seed, x, y) => { let h = (seed * 374761393 + x * 668265263 + y * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  const noise = seed => (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const v00 = hash(seed, ix, iy), v10 = hash(seed, ix + 1, iy), v01 = hash(seed, ix, iy + 1), v11 = hash(seed, ix + 1, iy + 1);
    const a = v00 + (v10 - v00) * sx, b = v01 + (v11 - v01) * sx; return a + (b - a) * sy;
  };
  const N1 = noise(7), N2 = noise(11);
  const rng = seed => { let a = (seed * 2654435761) >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const rint = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const RAMP = [[78, 22, 24], [128, 34, 26], [178, 52, 28], [222, 82, 34], [246, 124, 42], [252, 168, 58], [255, 208, 96], [255, 236, 164], [255, 252, 226]];
  const heat = h => (h <= 0.08 ? null : RAMP[Math.min(8, Math.floor(h * 9))]);
  const EY = [255, 236, 140], EO = [255, 160, 60], SMK = [[120, 112, 120], [90, 84, 96]];
  const STR = [207, 145, 246];
  const CACHE = new Map();
  const cached = (k, fn) => { let c = CACHE.get(k); if (!c) { c = fn(); CACHE.set(k, c); } return c; };

  // Pip's staff flame at size s (0..1), step t: a 48x72 sprite, the flame's base point at (24, 52).
  const FL_W = 48, FL_H = 72, FL_X = 24, FL_Y = 52;
  const flameSprite = (s, t) => cached('fl' + s + ':' + t, () => paint(FL_W, FL_H, put => {
    const x = FL_X, y = FL_Y + 4, H = Math.trunc(7 + 13 * s), W = Math.trunc(3 + 4 * s), B = Math.max(2, Math.trunc(2 + 2 * s)), peak = 0.18;
    for (let j = -B; j < H; j++) {
      const fy = j / H; let width;
      if (fy < peak) { const u = (peak - fy) / (peak + B / H); width = W * Math.sqrt(Math.max(0, 1 - u * u)); }
      else { const v = (fy - peak) / (1 - peak); width = W * Math.pow(1 - v, 0.85) * (0.9 + 0.2 * Math.sin(v * 3.1)); }
      const f0 = Math.max(0, fy), sway = Math.sin(f0 * 4 + t * 1.3) * f0 * 2.2;
      for (let dx = -W - 2; dx < W + 3; dx++) {
        const d = Math.abs(dx - sway) / (width + 0.01); if (d > 1.3) continue;
        const core = 1 - Math.min(1, Math.hypot((dx - sway) / (W + 0.01), (fy - 0.12) / 0.55));
        const turb = N1(dx * 0.45, (j - t * 2.2) * 0.38) * 0.7 + N2(dx * 0.9, (j - t * 3.1) * 0.8) * 0.45;
        const col = heat((1 - d) * 0.55 + core * 0.75 + (turb - 0.55) * 0.75 * (0.35 + f0));
        if (col) put(x + dx, y - j, col);
      }
    }
    const r = rng(1000 + t);
    for (let a = 0; a < 360; a += 24) if (r() < 0.5 * s) put(Math.round(x + (W + 2) * Math.cos(a * Math.PI / 180)), Math.round(y - 2 + (W + 2) * Math.sin(a * Math.PI / 180)), RAMP[2]);
    for (let k = 0; k < Math.trunc(4 + 8 * s); k++) {
      const ph = (t * 3 + k * 5) % 18, sx = x + rint(r, -4, 4) + ((k + t) % 3 - 1), sy = y - H - ph;
      put(sx, sy, ph < 5 ? RAMP[7] : ph < 11 ? RAMP[5] : RAMP[3]);
    }
  }));
  // Pip's fire bolt at step t (big: the Fireball ability): the ball's centre at (OX, OY) of the sprite.
  const FB = { n: { w: 60, h: 40, x: 50, y: 20, s: 1 }, b: { w: 84, h: 56, x: 70, y: 28, s: 1.4 } };
  const boltSprite = (t, big) => cached('fb' + t + (big ? 'b' : ''), () => { const P = FB[big ? 'b' : 'n']; return paint(P.w, P.h, put => {
    const x = P.x, y = P.y, s = P.s, r = rng(500 + t * 13), L = Math.round(26 * s);
    for (let k = -2; k < L; k++) {
      const fall = Math.max(0, k) / L, half = Math.pow(1 - fall, 0.7) * 5.2 * s, lift = fall * fall * 6 * s;
      for (let dy = Math.round(-7 * s); dy < Math.round(8 * s); dy++) {
        const cy = dy + lift + Math.sin(k * 0.5 + t * 1.9) * 1.3 * fall, d = Math.abs(cy) / (half + 0.01); if (d > 1.4) continue;
        const turb = N1(k * 0.35 / s + t * 1.7, dy * 0.5 / s + t * 0.6) * 0.8 + N2(k * 0.8 / s + t * 2.3, dy * 0.9 / s) * 0.5;
        const col = heat((1 - d) * (1 - fall) * 1.35 + (turb - 0.6) * 0.9 * (0.3 + fall));
        if (col) put(x - 4 - k, y + dy, col);
      }
    }
    for (let i = 0; i < Math.round(9 * s); i++) { const sx = x - 8 - rint(r, 0, L + 8), sy = y - rint(r, -5, 9) - Math.trunc((x - sx) / 5); put(sx, sy, i % 3 === 0 ? RAMP[7] : RAMP[5]); }
    const R = Math.ceil(5 * s);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const d = Math.hypot(dx, dy), rim = 4.3 * s + (N1(dx * 0.7 / s + t, dy * 0.7 / s - t) - 0.5) * 1.6;
      if (d <= rim) { const h = 1.05 - d / rim * 0.8 + (N2(dx * 0.8 / s + t * 2, dy * 0.8 / s) - 0.5) * 0.25; put(x + dx, y + dy, RAMP[Math.max(2, Math.min(8, Math.trunc(h * 9)))]); }
    }
  }); });
  // Tobin's swoosh: the arc of the sword tip around (98, 84), r 44; u = how far it has faded (0, 0.4, 0.8).
  // A 100x100 sprite drawn at art (48, 34).
  const swooshSprite = u => cached('sw' + u, () => paint(100, 100, put => {
    const cols = [[255, 244, 214], [242, 210, 150], [200, 150, 100]], a0 = -115, a1 = 40, start = a0 + (a1 - a0) * u * 0.6;
    for (let i = 0; i < Math.trunc(a1 - start) * 2; i++) {
      const a = (start + i / 2) * Math.PI / 180;
      cols.forEach((c, k) => put(Math.round(50 + (44 - k) * Math.cos(a)), Math.round(50 + (44 - k) * Math.sin(a)), c));
    }
  }));
  // Wren's bow string (bresenham, as animate.py); drawn = to the nock at full draw. A sprite covering x 60..140, y 30..120.
  // Tips measured on the v4 art (owner, 2026-09-30): the bow's curls in full draw, release and the wind-up.
  const STRING = { draw: [[121, 36], [122, 111]], release: [[121, 36], [122, 111]], wind: [[130, 55], [111, 113]] }, NOCK = [76, 74];
  const stringSprite = (kind, br) => cached('st' + kind + br, () => paint(80, 90, put => {
    const line = (p0, p1) => {
      let [x0, y0] = p0; const [x1, y1] = p1, dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
      for (;;) { put(x0 - 60, y0 - 30, STR); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    };
    const [t, b] = STRING[kind], T0 = [t[0], t[1] + br], B0 = [b[0], b[1] + br];
    if (kind === 'draw') { const n = [NOCK[0], NOCK[1] + br]; line(T0, n); line(n, B0); } else line(T0, B0);
  }));
  // v4: the arrow on the string at full draw (the art leaves it out). The fx arrow's fletching at the nock, its head past the
  // grip, and its shaft stretched between them (one column, stretched sideways: still whole pixels).
  const NOCKED = { x0: NOCK[0] - 2, x1: 150, y: NOCK[1] - 7 };
  function nockedArrow(g, A, ox, oy, br) {
    const y = oy + NOCKED.y + br, L = 18, H = 20, x0 = ox + NOCKED.x0, x1 = ox + NOCKED.x1;
    g.drawImage(A.c, 0, 0, L, A.h, x0, y, L, A.h);
    g.drawImage(A.c, L, 0, 1, A.h, x0 + L, y, x1 - H - x0 - L, A.h);
    g.drawImage(A.c, A.w - H, 0, H, A.h, x1 - H, y, H, A.h);
  }

  // ================= frames =================
  // A frame: { p: pose, br: breath 0/1, dx, buckle: [shift, bottomFrom], str: 'draw'|'release', arrow, waves, bat: [x, y],
  //   sw: swoosh fade, spark: [x, y, s], fl: Pip's flame size, em: embers step, fb: [x, y, k] bolt, sm: [x, y, t] smoke }.
  const BR = [0, 0, 1, 1, 1, 1, 0, 0];
  // Wren's bat flits at her top right, over the bow's top limb (owner, 2026-09-29: it used to sit on her left)
  const BAT_D = [80, -42], batAt = b => [b[0] + BAT_D[0], b[1] + BAT_D[1]];
  const BAT = [[34, 56], [35, 54], [36, 53], [35, 54], [34, 56], [33, 57], [32, 56], [33, 55]].map(batAt);
  const ORB = { ready: [134, 57], wind: [93, 29], cast: [151, 59], camp: [124, 56], hurt: [140, 62], kneel: [130, 56], fallen: [149, 103] };
  const range = n => Array.from({ length: n }, (_, i) => i);
  // v4 (owner, 2026-09-30): the wind-up opens the shot, the brace is her block, and she kneels then falls when she dies.
  const AR_Y = 67, AR_X = 140;   // the flying arrow's top left as it leaves the grip (fx arrow, 58x14)
  function wrenAnims() {
    const fight = (o = {}) => Object.assign({ p: 'draw', str: 'draw', nock: 1, bat: batAt([34, 56]) }, o);
    const rel = o => Object.assign({ p: 'release', str: 'release' }, o);
    const hurt = (bat, dx = 0) => ({ p: 'hurt', bat: batAt(bat), dx });
    const attack = [{ p: 'wind', str: 'wind', bat: batAt([34, 56]) }, fight({ br: 1 }), fight({ br: 1 })]
      .concat([0, 18, 36, 54].map((ax, k) => rel({ arrow: [AR_X + ax, AR_Y], waves: k < 3 ? [AR_X + ax + 48, AR_Y - 6] : null, bat: batAt([34, 52]) })))
      .concat([rel({ bat: batAt([34, 54]) }), { p: 'wind', str: 'wind', bat: batAt([34, 55]) }, fight()]);
    const f = (p, o) => Object.assign({ p }, o);
    const block = [fight(), f('block', { bat: batAt([30, 50]) }), f('block', { bat: batAt([28, 48]), spark: [128, 70, 5] }), f('block', { bat: batAt([28, 48]), spark: [128, 70, 3] }), f('block', { bat: batAt([30, 50]) }), fight()];
    const path = [[112, 24], [116, 36], [120, 48], [126, 58], [130, 68], [134, 78], [136, 86], [136, 88]];   // the bat drifts down to her
    return {
      campIdle: { ms: 160, loop: true, f: range(8).map(i => ({ p: 'camp', br: BR[i], bat: BAT[i] })) },
      fightIdle: { ms: 160, loop: true, f: range(8).map(i => fight({ br: BR[i], bat: BAT[i] })) },
      attack: { ms: 90, hit: 3, f: attack },
      ability: { ms: 90, hit: 3, f: attack.map(f => (f.arrow ? Object.assign({}, f, { echo: true, waves: [f.arrow[0] + 48, AR_Y - 6] }) : f)) },   // Echo Shot: three waves on every flight frame
      block: { ms: 110, f: block },
      hurt: { ms: 90, f: [fight(), hurt([30, 46]), hurt([28, 42], -1), hurt([30, 46], -1), hurt([32, 52]), fight()] },
      death: { ms: 130, f: [hurt([30, 46]), hurt([28, 42], -1)].concat([0, 1, 1, 0, 0, 1].map((b, i) => f('kneel', { br: b, bat: path[Math.min(i, 3)] })))
        .concat(range(8).map(i => f('fallen', { bat: path[Math.min(7, 4 + i)] }))) }
    };
  }
  function tobinAnims() {
    const f = (p, o) => Object.assign({ p }, o);
    const block = [f('ready'), f('block'), f('block', { spark: [150, 78, 5] }), f('block', { spark: [150, 78, 3] }), f('block'), f('ready')];
    return {
      campIdle: { ms: 160, loop: true, f: range(8).map(i => f('camp', { br: BR[i] })) },
      fightIdle: { ms: 160, loop: true, f: range(8).map(i => f('ready', { br: BR[i] })) },
      attack: { ms: 80, hit: 4, f: [f('ready'), f('wind'), f('wind'), f('wind'), f('strike', { sw: 0 }), f('strike', { sw: 0.4 }), f('strike', { sw: 0.8 }), f('strike'), f('ready'), f('ready')] },
      ability: { ms: 110, hit: 2, f: block },
      block: { ms: 110, f: block },
      hurt: { ms: 90, f: [f('ready'), f('hurt'), f('hurt'), f('hurt'), f('ready'), f('ready')] },
      death: { ms: 130, f: [f('hurt'), f('hurt')].concat([0, 1, 1, 0, 0, 1].map(b => f('kneel', { br: b }))).concat(range(8).map(() => f('fallen'))) }
    };
  }
  function pipAnims() {
    const f = (p, fl, o) => Object.assign({ p, fl }, o);
    const atk = big => [f('ready', 1)].concat([1, 2, 3].map(t => f('wind', 1, { em: t, big })))
      .concat([160, 178, 196, 214].map((x, k) => f('cast', 0.5, { fb: [x, 59, k], big }))).concat([f('ready', 0.6), f('ready', 1)]);
    return {
      campIdle: { ms: 160, loop: true, f: range(8).map(i => f('camp', 0.55, { br: BR[i] })) },
      fightIdle: { ms: 130, loop: true, f: range(8).map(i => f('ready', 1, { br: BR[i] })) },
      attack: { ms: 90, hit: 4, f: atk(false) },
      ability: { ms: 90, hit: 4, f: atk(true) },
      hurt: { ms: 90, f: [f('ready', 1), f('hurt', 0.5, { sm: [96, 50, 0] }), f('hurt', 0.5, { sm: [96, 50, 1] }), f('hurt', 0.6, { sm: [96, 50, 2] }), f('ready', 1), f('ready', 1)] },
      death: { ms: 130, f: [f('hurt', 0.6), f('hurt', 0.4)].concat([[0, 0.5], [1, 0.5], [1, 0.4], [0, 0.3], [0, 0.3], [1, 0.25]].map(([b, fl]) => f('kneel', fl, { br: b })))
        .concat([f('fallen', 0.25), f('fallen', 0, { sm: [149, 101, 0] }), f('fallen', 0, { sm: [149, 101, 1] })]).concat(range(5).map(() => f('fallen', 0))) }
    };
  }
  // ================= gathering (owner, 2026-09-30): empty-fist poses, the tool drawn in code =================
  // The poses (g1..g7) come from GPT's gathering sheets through tools/art/gathersheet.py. GRIP: each pose's fists (art
  // coords, measured on the converted sheets). A tool is drawn from the grip along an angle (degrees: 0 = right,
  // 90 = down); `back` draws it behind the hero (swung back over the head or the shoulder).
  const GRIP = {
    tobin: { g1: [95, 96], g2: [85, 86], g3: [71, 70], g4: [86, 44], g5: [110, 95], g6: [100, 100], g7: [125, 85] },
    pip: { g1: [93, 108], g2: [76, 97], g3: [86, 83], g4: [86, 50], g5: [100, 106], g6: [97, 107], g7: [126, 92] }
  };
  // the node's skill -> the tool; tool -> [rest, wind-up, strike] as [pose, angle, back]
  const GATHER_TOOL = { mine: 'pick', wood: 'axe', forage: 'sickle', hunt: 'spear' };
  const nodeTool = () => GATHER_TOOL[typeof skillOf === 'function' && S.node ? skillOf(S.node.kind) : ''] || 'pick';
  const gatherIdle = A => (A['gatherIdle_' + nodeTool()] ? 'gatherIdle_' + nodeTool() : 'campIdle');
  const GATHER_POSE = {
    pick: [['g1', 35], ['g4', -125, 1], ['g5', 60]],
    axe: [['g1', 35], ['g3', -150, 1], ['g7', 0]],
    sickle: [['g1', 45], ['g2', 200], ['g6', 25]],
    spear: [['g1', -25], ['g3', -8], ['g7', 0]]
  };
  const TC = { wood: [150, 98, 56], woodD: [98, 62, 34], iron: [214, 218, 226], ironM: [150, 156, 170], ironD: [96, 100, 116], line: [30, 24, 36] };
  // A tool as pixels in its own frame (u along the handle from the grip, v across it), turned to `ang` and outlined.
  // An 80x80 sprite with the grip at (40, 40).
  const toolSprite = (tool, ang) => cached('tool' + tool + ang, () => {
    const px = new Map(), r = ang * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r);
    const P = (u, v, col) => { const x = Math.round(40 + u * c - v * sn), y = Math.round(40 + u * sn + v * c); px.set(x + ',' + y, col); };
    const shaft = (u0, u1) => { for (let u = u0; u <= u1; u += 0.5) { P(u, 0, TC.wood); P(u, 1, TC.woodD); } };
    if (tool === 'pick') {
      shaft(-3, 22);
      for (let v = -11; v <= 11; v += 0.5) { const u = 23 - (v * v) / 26, tip = Math.abs(v) > 8; P(u, v, tip ? TC.iron : TC.ironM); P(u + 1, v, tip ? TC.ironM : TC.ironD); }
    } else if (tool === 'axe') {
      shaft(-3, 22);
      for (let u = 14; u <= 23; u += 0.5) { const w = 3 + (u - 14) * 0.75; for (let v = -1; v >= -w; v -= 0.5) P(u, v, v <= -w + 1.5 ? TC.iron : u > 21 ? TC.ironD : TC.ironM); }
      for (let u = 18; u <= 23; u += 0.5) { P(u, 2, TC.ironD); P(u, 3, TC.ironD); }   // the poll behind the handle
    } else if (tool === 'sickle') {
      shaft(-2, 7);
      for (let a = 90; a >= -135; a -= 4) { const ar = a * Math.PI / 180; P(9 + 8 * Math.cos(ar), -8 + 8 * Math.sin(ar), a < -60 ? TC.iron : TC.ironM); P(9 + 7 * Math.cos(ar), -8 + 7 * Math.sin(ar), TC.ironD); }
    } else {   // spear: a long shaft through the grip, a leaf-shaped head
      shaft(-14, 26);
      [1, 2, 2, 2, 1, 1, 0].forEach((w, i) => { for (let v = -w; v <= w + 1; v += 0.5) P(27 + i, v, Math.abs(v - 0.5) < 1 ? TC.iron : TC.ironM); });
    }
    return paint(80, 80, put => {
      const has = (x, y) => px.has(x + ',' + y);
      for (const k of px.keys()) { const [x, y] = k.split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!has(x + dx, y + dy)) put(x + dx, y + dy, TC.line); }
      for (const [k, col] of px) { const [x, y] = k.split(',').map(Number); put(x, y, col); }
    });
  });
  function gatherAnims() {
    const out = {};
    for (const tool of Object.keys(GATHER_POSE)) {
      const [rest, wind, strike] = GATHER_POSE[tool];
      const f = ([p, ang, back], o) => Object.assign({ p, tool, ang, back: !!back }, o);
      out['gather_' + tool] = { ms: 90, hit: 2, f: [f(wind), f(wind), f(strike), f(strike), f(strike), f(rest)] };
      out['gatherIdle_' + tool] = { ms: 160, loop: true, f: range(8).map(i => f(rest, { br: BR[i] })) };
    }
    return out;
  }
  const ANIMS = { wren: wrenAnims(), tobin: Object.assign(tobinAnims(), gatherAnims()), pip: Object.assign(pipAnims(), gatherAnims()) };
  for (const id in ANIMS) { const A = ANIMS[id]; if (!A.block) A.block = { ms: 90, f: A.fightIdle.f.slice(0, 4) }; }
  heroArtStates = id => {
    const A = ANIMS[id]; if (!A) return null;
    const out = {}; for (const k in A) out[k] = { n: A[k].f.length, ms: A[k].ms, loop: !!A[k].loop, hit: A[k].hit || 0 }; return out;
  };

  // ================= drawing =================
  // Pose rows [ya, yb) of P (art coords) drawn with a vertical offset: pixel-exact sub-rects.
  function rows(g, P, ox, oy, ya, yb, dy, dx) {
    const a = Math.max(ya, P.y0) - P.y0, b = Math.min(yb, P.y0 + P.h) - P.y0; if (b <= a) return;
    g.drawImage(P.c, 0, a, P.w, b - a, ox + P.x0 + (dx || 0), oy + P.y0 + a + dy, P.w, b - a);
  }
  // a box of the pose (art coords) redrawn in place (Wren's forearm over the string)
  function box(g, P, ox, oy, x0, y0, x1, y1, dy) {
    const a = Math.max(x0, P.x0), b = Math.min(x1, P.x0 + P.w), c = Math.max(y0, P.y0), d = Math.min(y1, P.y0 + P.h);
    if (b > a && d > c) g.drawImage(P.c, a - P.x0, c - P.y0, b - a, d - c, ox + a, oy + c + dy, b - a, d - c);
  }
  const put1 = (g, x, y, c) => { g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; g.fillRect(x, y, 1, 1); };
  function drawFrame(g, id, fr, ox, oy, flT, calm, noFly) {
    const S0 = set(id), P = S0.poses[fr.p], br = calm ? 0 : fr.br | 0;
    const tool = fr.tool && GRIP[id] && GRIP[id][fr.p], drawTool = () => g.drawImage(toolSprite(fr.tool, fr.ang), ox + tool[0] - 40, oy + tool[1] - 40 + br);
    if (tool && fr.back) drawTool();
    if (fr.buckle) { rows(g, P, ox, oy, 0, CUT, fr.buckle[0]); rows(g, P, ox, oy, fr.buckle[1], 192, 0); }
    else if (br) { rows(g, P, ox, oy, 0, CUT, br, fr.dx); rows(g, P, ox, oy, CUT, 192, 0, fr.dx); }
    else g.drawImage(P.c, ox + P.x0 + (fr.dx || 0), oy + P.y0);
    if (tool && !fr.back) drawTool();
    if (fr.str) {
      g.drawImage(stringSprite(fr.str, br), ox + 60, oy + 30);
      if (fr.nock && !noFly) nockedArrow(g, S0.fx.arrow, ox, oy, br);
      if (fr.str === 'draw') box(g, P, ox, oy, 70, 68, 84, 80, br);   // the drawing hand over the string and the arrow's nock
    }
    if (fr.sw != null) g.drawImage(swooshSprite(fr.sw), ox + 48, oy + 34);
    if (fr.spark) { const [x, y, s] = fr.spark; g.fillStyle = 'rgb(255,236,170)'; g.fillRect(ox + x - s, oy + y, 2 * s + 1, 1); g.fillRect(ox + x, oy + y - s, 1, 2 * s + 1); }
    // Pip: the live staff flame (under the cast effects, as animate.py layers it)
    let light = null;
    if (fr.fl > 0) {
      const o = ORB[fr.p], s = Math.round(fr.fl * 20) / 20, st = calm ? Math.floor(flT * 2) % 8 : Math.floor(flT * 1000 / 130) % 8;
      g.drawImage(flameSprite(s, st), ox + o[0] - FL_X, oy + o[1] - 3 + br - FL_Y);
      light = { x: o[0], y: o[1] - 3 + br - 6, rgb: '255,150,60', r: Math.round(14 + 26 * s), size: 4, pulse: true };
    }
    if (fr.em) {   // embers gathering at the staff during the wind-up (animate.py embers(), n 7, r 12; more for the Fireball)
      const o = ORB[fr.p], r = rng(fr.em * 97), n = fr.big ? 12 : 7, rad = (fr.big ? 16 : 12) * (1 - fr.em / 4);
      for (let i = 0; i < n; i++) { const a = r() * 6.28, d = rad + r() * 2 - 1; put1(g, ox + Math.trunc(o[0] + d * Math.cos(a)), oy + Math.trunc(o[1] + d * Math.sin(a)), i % 2 ? EO : EY); }
    }
    if (fr.fb && !noFly) { const P2 = FB[fr.big ? 'b' : 'n']; g.drawImage(boltSprite(fr.fb[2], fr.big), ox + fr.fb[0] - P2.x, oy + fr.fb[1] - P2.y); }
    if (fr.sm) {
      const [x, y, t] = fr.sm, pts = [[0, 0], [1, -1], [-1, -2], [0, -3], [2, -4], [1, -5]];
      pts.forEach(([dx, dy], i) => { if (i <= t + 2) put1(g, ox + x + dx, oy + y + dy - t * 2, SMK[i % 2]); });
    }
    if (fr.arrow && !noFly) g.drawImage(S0.fx.arrow.c, ox + fr.arrow[0], oy + fr.arrow[1]);
    if (fr.waves && !noFly) {
      g.drawImage(S0.fx.waves.c, ox + fr.waves[0], oy + fr.waves[1]);
      if (fr.echo) { g.drawImage(S0.fx.waves.c, ox + fr.waves[0] - 12, oy + fr.waves[1] - 14); g.drawImage(S0.fx.waves.c, ox + fr.waves[0] - 12, oy + fr.waves[1] + 14); }
    }
    if (fr.bat) { const b = calm && !fr.str && fr.p !== 'kneel' && fr.p !== 'fallen' && fr.p !== 'hurt' ? BAT[0] : fr.bat; g.drawImage(S0.fx.bat.c, ox + b[0], oy + b[1]); }
    return { P, light };
  }
  const INFO = { frame: 0, n: 0, done: false, x0: 0, y0: 0, f: { c: null, ox: 0, oy: 0, lights: [] } };
  heroArtDraw = function (g, id, state, t, x, y, opts) {
    const A = D && ANIMS[id]; if (!A) return null;
    const an = A[state] || A.fightIdle, n = an.f.length, o = opts || {}, calm = red();
    let i = o.frame != null ? o.frame : Math.floor(Math.max(0, t) * 1000 / an.ms);
    const done = !an.loop && i >= n;
    i = an.loop ? (calm ? 0 : ((i % n) + n) % n) : Math.max(0, Math.min(n - 1, i));
    const ox = Math.round(x) - AX, oy = Math.round(y) - AY;
    if (o.alpha != null) g.globalAlpha = o.alpha;
    const r = drawFrame(g, id, an.f[i], ox, oy, o.flameT != null ? o.flameT : t, calm, o.noFly);
    INFO.frame = i; INFO.n = n; INFO.done = done; INFO.x0 = ox + r.P.x0; INFO.y0 = oy + r.P.y0;
    const f = INFO.f; f.c = r.P.c; f.ox = AX - r.P.x0; f.oy = AY - r.P.y0; f.lights.length = 0;
    if (r.light) { r.light.x -= r.P.x0; r.light.y -= r.P.y0; f.lights.push(r.light); }
    return INFO;
  };

  // The picker and the camp hero switch: the camp pose, centred, feet near the bottom, at art scale (1 art px = 1 canvas px).
  heroArtPreview = (cv, id) => {
    if (!D || !D.heroes[id] || !cv) return false;
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, cv.width, cv.height);
    return !!heroArtDraw(g, id, 'campIdle', 0, cv.width / 2, cv.height - 4, { frame: 0 });
  };

  // ================= the stage adapter (62-stage drawActor hook) =================
  // The stage's swing: wind 0.14 s (62-stage WIND), then the strike fires the projectile or lands the hit. The art's
  // wind-up frames are fitted into the wind; from the release frame on the animation runs at the viewer's timing.
  // Hurt (a hit flash) plays over the idle; death holds the fallen frame until the hero stands up.
  const WIND = 0.14;
  const ST = { id: '', s: 'fightIdle', t0: 0, hitT: -1, lastSt: 0, lastFl: 0, ab: -9, parry: -9, sawParry: -9 };
  if (typeof on === 'function') {
    on('ability', () => { ST.ab = typeof T === 'number' ? T : 0; });
    on('soloParry', p => { if (p && p.res === 'parry') ST.parry = typeof T === 'number' ? T : 0; });
  }
  const now = () => (typeof T === 'number' ? T : 0);
  const go = s => { ST.s = s; ST.t0 = now(); ST.hitT = -1; };
  heroArtStage = function (g, a, x, alpha) {
    const id = heroArtId(); if (!id || !ANIMS[id]) return false;
    const t = now(), A = ANIMS[id], tg = typeof target === 'function' ? target() : 'mob';
    if (id !== ST.id) { ST.id = id; go('fightIdle'); }
    if (a.down) { if (ST.s !== 'death') go('death'); }
    else if (tg === 'node') {
      // Gathering. The node's tool picks the set (gather_pick / _axe / _sickle / _spear: wind-up, `hit` frame, follow-through,
      // like `attack`), played on each swing of the stage (a.st 1 = wind, 2 = strike; the chips fly on the strike); between
      // swings the hero rests with the tool (gatherIdle_*). A hero without gathering art (Wren, for now) swings its attack
      // and rests in the camp pose.
      const tk = nodeTool(), GA = A['gather_' + tk] ? 'gather_' + tk : 'attack', GI = gatherIdle(A);
      if (ST.s === 'death') go(GI);
      if (a.st === 1 && ST.lastSt !== 1) go(GA);
      else if (ST.s !== GA && ST.s !== GI) go(GI);
    } else {
      if (ST.s === 'death' || ST.s === 'campIdle' || ST.s.startsWith('gather')) go('fightIdle');
      if (a.st === 1 && ST.lastSt !== 1) go(t - ST.ab < 0.35 ? 'ability' : 'attack');
      else if (ST.parry > ST.sawParry) { ST.sawParry = ST.parry; if (ST.s === 'fightIdle' || ST.s === 'hurt') go('block'); }
      else if (a.flash > 0.03 && a.flash > ST.lastFl + 0.01 && ST.s === 'fightIdle') go('hurt');
    }
    ST.lastSt = a.st; ST.lastFl = a.flash;
    const an = A[ST.s] || A.fightIdle, rest = tg === 'node' ? gatherIdle(A) : 'fightIdle';   // where a finished swing settles
    let frame;
    if ((ST.s === 'attack' || ST.s === 'ability' || ST.s.startsWith('gather_')) && an.hit) {
      if (ST.hitT < 0 && a.st === 1) frame = Math.min(an.hit - 1, Math.floor((t - ST.t0) / WIND * an.hit));
      else { if (ST.hitT < 0) ST.hitT = t; frame = an.hit + Math.floor((t - ST.hitT) * 1000 / an.ms); }
      if (frame >= an.f.length) { go(rest); frame = null; }
    } else if (!an.loop && ST.s !== 'death') {
      frame = Math.floor((t - ST.t0) * 1000 / an.ms);
      if (frame >= an.f.length) { go(rest); frame = null; }
    }
    // The art is wider than the baked sprites: on a narrow stage the whole hero (and Wren's bat) stays in view.
    x = Math.max(x, set(id).left + 2);
    // noFly: the stage fires its own arrow or bolt at the target (62-stage fire()), so the art's in-flight one is skipped
    const info = heroArtDraw(g, id, ST.s, t - ST.t0, x, a.hy + a.dy, { frame, flameT: t, alpha, noFly: true });
    if (!info) return false;
    a._x = info.x0; a._y = info.y0;
    // a frame record like the baker's (the stage reads c, ox, oy, lights); a fallen hero has none, like a down member
    a._f = a.down ? null : info.f;
    return true;
  };

  // decode the playing hero's poses in idle time (about 8 ms), not inside the first stage frame
  if (typeof idleTask === 'function') idleTask(() => { try { const id = heroArtId(); if (id) set(id); } catch (e) { console.error('[lanternfall] hero art', e); } });

  // ================= the header portrait =================
  // 28 x 28 art px of the camp pose around the face, shown 1:1 in the 28 px portrait box (no scaling).
  // FACE: the face's centre in the camp pose (art coords, picked by eye); the crop sits a little above it.
  const PORTRAITS = {}, FACE = { wren: [91, 62], tobin: [92, 57], pip: [95, 70] };
  heroArtPortraitURL = id => {
    if (!D || !D.heroes[id] || !FACE[id]) return '';
    if (PORTRAITS[id] != null) return PORTRAITS[id];
    const P = set(id).poses.camp, [fx, fy] = FACE[id], c = mk(28, 28), g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(P.c, fx - 14 - P.x0, fy - 16 - P.y0, 28, 28, 0, 0, 28, 28);
    try { PORTRAITS[id] = c.toDataURL(); } catch (e) { PORTRAITS[id] = ''; }
    return PORTRAITS[id];
  };
  // 70-ui's updatePortrait (a function in the shared scope): the new art replaces the header portrait for
  // Wren, Tobin and Pip; everyone else keeps the baked one.
  if (typeof updatePortrait === 'function' && typeof document !== 'undefined' && typeof $ === 'function') {
    const base = updatePortrait;
    updatePortrait = function () {
      base();
      try { const id = heroArtId(), u = id ? heroArtPortraitURL(id) : ''; if (u && $('portrait')) $('portrait').src = u; } catch (e) { console.error('[lanternfall] hero art portrait', e); }
    };
    on('soloHero', () => updatePortrait());
  }
}
