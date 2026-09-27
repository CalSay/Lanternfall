// 12a-art-body: the B1 character kit (16-bit, about 4 heads, 35 art px tall, drawn at 2x).
// DATA and pure maths only: no DOM at load or at call time. Loads in Node too.
// Guide: docs/design/art-direction.md. Reference: prototypes/style-study.html (direction B1).
//
// How a character is drawn: an outfit is a build(k, g) function that calls the helpers below
// with shapes written RELATIVE TO BODY ANCHORS on the kit `k` (k.shY shoulders, k.waY waist,
// k.hiY hips, k.sw half shoulder width, k.hipW half hip width, k.pF / k.pB shoulder pivots,
// k.hF / k.hB hand points, k.hx / k.hy / k.hw / k.hh head centre and radii, k.chin, k.top,
// k.bootH, k.legR, k.armR, k.handR, k.H body height). Feet at (0, 0), facing right, y up is
// negative. k.add(z, bone, mat, shape, opt) adds one piece; k.held(z, 'F'|'B', tilt, items)
// adds pieces in a held item's frame (origin at the hand, -y along the item).
// 60b-baker.js turns the pieces into pixels: 3 tones per material, section lines, cast shadow,
// despeckle, ink outline, face stamps.
//
// Registries filled by the outfit files (12b heroes, 12c-12f companions by circle):
//   AK.CLASSES[key] = { name, hs, ws, hd?, armW?, handS?, aF, aB, anim, slots: { weapon|off|head|body|charm: { fam, fam2?, dye?, dyeAmt? } }, build(k, g, look) }
//   AK.CHARS[key]   = { name, circle, hs, ws, ..., anim, wpn: { fam, fam2?, t, r, glow? }, build(k, w) }
// g.weapon / g.off / g.head / g.body / g.charm (and w) are gear material sets from gearMats(), or null.
//
// Exposed names: AK (the kit), RIG (compat: RIG.COMPANIONS, RIG.CLASSES for older callers).

const AK = (() => {
  // ================= colour =================
  const toHsl = hex => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; };
  const hsl = (h, s, l) => { h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(2, Math.min(98, l)) / 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); const to = x => Math.round(x * 255).toString(16).padStart(2, '0'); return '#' + to(f(0)) + to(f(8)) + to(f(4)); };
  const toward = (h, t, amt) => { const d = ((t - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), amt); };
  const mix = (a, b, t) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = sh => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t); return '#' + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1); };
  const lift = (hex, dl) => { const [h, s, l] = toHsl(hex); return hsl(h, s, l + dl); };
  const hueShift = (hex, deg) => { const [h, s, l] = toHsl(hex); return hsl(h + deg, s, l); };
  const rgbOf = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16 & 255},${n >> 8 & 255},${n & 255}`; };

  // Ink: the outline of every sprite (1 art px = 2 CSS px on screen).
  const INK = '#120B18';
  // 3 tones per material (highlight, base, shade) plus a line colour: a dark, desaturated tone of
  // the material itself, used where one piece sits on another. Skin lines are warm brown.
  // Highlights lean toward gold (hue 50), shades toward plum (262); skin shades toward red.
  function ramp3(hex, kind) {
    const [h, s, l] = toHsl(hex), sk = kind === 'skin', met = kind === 'metal';
    const cool = sk ? 8 : 262;
    return {
      c: [hsl(toward(h, 50, 10), s * (met ? .55 : .92), l + (met ? 23 : 15)), hsl(h, s * 1.04, l), hsl(toward(h, cool, sk ? 10 : 16), Math.min(100, s * 1.06), l - (met ? 19 : 16))],
      line: sk ? hsl(14, 42, Math.max(12, l - 44)) : hsl(toward(h, cool, 24), Math.min(60, s * .85 + 8), Math.max(8, Math.min(34, l - 32))),
      ol: INK
    };
  }
  // A material: base colour + kind. Kinds: cloth, leather, metal, skin, hair, wood, stone, gem,
  // slime (3 tones); flat (one colour, no light); glow (one colour, emits light unless nolight).
  // extra: { light: '#hex' light colour, line: '#hex' for flat/glow pieces }.
  const m = (hex, kind = 'cloth', extra) => Object.assign({ hex, kind }, extra || {});

  // ================= materials by family and tier (index = tier - 1) =================
  const FAM = {
    ore: { names: ['Copper', 'Iron', 'Mithril', 'Starsteel', 'Emberite'], col: ['#B8743E', '#9CA4B4', '#86C8D6', '#A99AE0', '#D8643A'], kind: 'metal', glow: ['#FFC080', '#DDEEFF', '#A8F4FF', '#DCCBFF', '#FF9A5A'] },
    wood: { names: ['Oak', 'Yew', 'Ironbark', 'Ghostwood', 'Lanternwood'], col: ['#8A5E3A', '#6E4432', '#5E5A4A', '#AFC4BE', '#C27A34'], kind: 'wood', glow: ['#FFD08A', '#FFC08A', '#D8F0B0', '#C8FFF4', '#FFC060'] },
    crystal: { names: ['Quartz', 'Amber', 'Moonstone', 'Starglass', 'Emberglass'], col: ['#D8D8E6', '#F2A93B', '#B8C8FF', '#9FE8FF', '#FF6A5A'], kind: 'gem', glow: ['#FFFFFF', '#FFD080', '#D8E0FF', '#C8FAFF', '#FF9A80'] },
    fibre: { names: ['Flax', 'Nettle', 'Silkgrass', 'Moonsilk', 'Gloamsilk'], col: ['#C8B890', '#7E9860', '#DCD6B8', '#B8C8E4', '#7A6EAE'], kind: 'cloth', glow: ['#FFF0C0', '#E0FFB0', '#FFFFE0', '#E0F0FF', '#C8B8FF'] },
    hide: { names: ['Soft', 'Tough', 'Scaled', 'Dusk', 'Ember'], col: ['#A07C5E', '#7E5E3C', '#546E60', '#52445E', '#A83C36'], kind: 'leather', glow: ['#FFD8A8', '#FFC890', '#B0F0D0', '#D8B8FF', '#FF8A6A'] }
  };
  const GOLD = '#E4B44A', SILVER = '#C4C8D4';
  // Gear material set for one item: tier t 1-5, rarity r 0-3 (Common, Rare, Epic, Legendary).
  //   P primary (tier colour of fam, or dyed), D darker primary, Q secondary family,
  //   R trim (gold from Rare, else D), G glow (Epic and up, else null), L lamp glass (always lit),
  //   C crystal (glowing from Epic, else a gem), gold, silver. on: true. pulse at Legendary.
  function gearMats(spec, t, r, glow) {
    t = Math.max(1, Math.min(5, t | 0 || 1)); r = Math.max(0, Math.min(3, r | 0));
    const i = t - 1, f = FAM[spec.fam] || FAM.ore, f2 = FAM[spec.fam2 || spec.fam] || f;
    let base = f.col[i];
    if (spec.dye) base = mix(base, spec.dye, spec.dyeAmt != null ? spec.dyeAmt : .6);
    const gcol = glow || f.glow[i];
    const cry = FAM.crystal.col[i];
    return {
      on: true, t, r, fam: spec.fam,
      P: m(base, f.kind), D: m(lift(base, -14), f.kind), Q: m(spec.q || f2.col[i], f2.kind),
      R: r >= 1 ? m(spec.trim || (r >= 3 ? '#F2C14E' : GOLD), 'metal') : m(lift(base, -14), f.kind),
      G: r >= 2 ? m(gcol, 'glow', { light: gcol }) : null,
      C: r >= 2 ? m(mix(cry, '#FFFFFF', .3), 'glow', { light: glow || FAM.crystal.glow[i] }) : m(cry, 'gem'),
      L: m(mix('#FFD88A', cry, .22), 'glow', { light: mix('#FFB060', cry, .25) }),
      gold: m(GOLD, 'metal'), silver: m(SILVER, 'metal'),
      pulse: r >= 3
    };
  }
  const SKINS = ['#F2C39A', '#C98E62', '#8A5A3C'];
  const HAIRS = ['#3A2A24', '#8A4A2A', '#D8B070', '#B8B4C0'];

  // ================= shapes (art px, feet at 0,0, facing right) =================
  const E = (cx, cy, rx, ry, a = 0) => ({ t: 'e', cx, cy, rx, ry, a });           // ellipse
  const P = (...pts) => ({ t: 'p', pts: pts.flat() });                              // polygon (flat list or arrays)
  const C = (x1, y1, r1, x2, y2, r2) => ({ t: 'c', x1, y1, r1, x2, y2, r2 });       // capsule (tapered)
  const R = (x, y, w, h) => P(x, y, x + w, y, x + w, y + h, x, y + h);             // rectangle
  const Q = (x, y, w = 1, h = 1) => ({ t: 'q', x, y, w, h });                       // whole-pixel stamp
  function arcPts(cx, cy, rx, ry, a0, a1, n) { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); } return o; }
  function ringP(cx, cy, rx, ry, t, n = 20) { const o = arcPts(cx, cy, rx, ry, 0, Math.PI * 2, n), i = arcPts(cx, cy, rx - t, ry - t, Math.PI * 2, 0, n); return P(o, i); }
  function rrect(x, y, w, h, r) { const o = []; const c = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]]; for (const [cx, cy, a] of c) o.push(...arcPts(cx, cy, r, r, a, a + Math.PI / 2, 3)); return P(o); }
  function blob(cx, cy, rx, ry, n, jit, seed) { let s = seed * 9301 + 49297; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 - jit + rnd() * jit * 2; o.push(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k); } return P(o); }
  function rotP(x, y, c, a) { if (!a) return [x, y]; const dx = x - c[0], dy = y - c[1], co = Math.cos(a), si = Math.sin(a); return [c[0] + dx * co - dy * si, c[1] + dx * si + dy * co]; }
  function mapShape(s, f, da) {
    switch (s.t) {
      case 'e': { const [cx, cy] = f(s.cx, s.cy); return { t: 'e', cx, cy, rx: s.rx, ry: s.ry, a: s.a + da }; }
      case 'c': { const [x1, y1] = f(s.x1, s.y1), [x2, y2] = f(s.x2, s.y2); return { t: 'c', x1, y1, r1: s.r1, x2, y2, r2: s.r2 }; }
      case 'p': { const o = []; for (let i = 0; i < s.pts.length; i += 2) o.push(...f(s.pts[i], s.pts[i + 1])); return { t: 'p', pts: o }; }
      case 'q': { const [x, y] = f(s.x, s.y); return { t: 'q', x, y, w: s.w, h: s.h }; }
    }
    return s;
  }
  function shapeBox(s) {
    if (s.t === 'e') { const r = Math.max(s.rx, s.ry); return [s.cx - r, s.cy - r, s.cx + r, s.cy + r]; }
    if (s.t === 'c') return [Math.min(s.x1 - s.r1, s.x2 - s.r2), Math.min(s.y1 - s.r1, s.y2 - s.r2), Math.max(s.x1 + s.r1, s.x2 + s.r2), Math.max(s.y1 + s.r1, s.y2 + s.r2)];
    if (s.t === 'q') return [s.x - 1, s.y - 1, s.x + s.w + 1, s.y + s.h + 1];
    let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (let i = 0; i < s.pts.length; i += 2) { a = Math.min(a, s.pts[i]); c = Math.max(c, s.pts[i]); b = Math.min(b, s.pts[i + 1]); d = Math.max(d, s.pts[i + 1]); } return [a, b, c, d];
  }

  // ================= the B1 body =================
  // Anchors for the default build (hs = ws = 1): head centre (hx, hy) and radii (hw, hh),
  // shoulders shY and half width sw, waist waY, hips hiY and half width hipW, limb radii,
  // boot height and toe length, arm length. H: total height (art px).
  const BODY = { hx: .3, hy: -30.3, hh: 4.6, hw: 5, shY: -25.4, sw: 5.1, waY: -18, hiY: -13.2, hipW: 4.1, legR: 1.8, bootH: 3.6, bootL: 2.4, armR: 1.55, handR: 1.65, armL: 10 };
  const H = 34, U = .72, BEV = 1.3;
  // Pose values: rF / rB rotate the front / back arm at the shoulder, wF / wB the wrist (held item),
  // lean tilts the upper body about the hips, bob lowers it (idle breathing), hb drops the head,
  // dx / dy move the whole figure, fall lays it down (radians about the feet).
  const POSE0 = { rF: 0, rB: 0, wF: 0, wB: 0, lean: 0, bob: 0, hb: 0, dx: 0, dy: 0, fall: 0 };

  // ch: { hs height scale, ws width scale, hd head scale, armW, handS, aF, aB resting arm angles }
  function makeKit(ch, pose) {
    const B = BODY, hs = ch.hs || 1, ws = ch.ws || 1, hd = ch.hd || 1;
    const k = { H, u: U, parts: [], ord: 0, pose: Object.assign({}, POSE0, pose), small: true, face: null };
    k.hiY = B.hiY * hs; k.waY = B.waY * hs; k.shY = B.shY * hs;
    k.hh = B.hh * hd; k.hw = B.hw * hd; k.hy = k.shY - (B.shY - B.hy) * hd; k.hx = B.hx;
    k.top = k.hy - k.hh; k.chin = k.hy + k.hh;
    k.sw = B.sw * ws; k.hipW = B.hipW * ws; const sq = Math.sqrt(ws);
    k.legR = B.legR * sq; k.armR = B.armR * sq * (ch.armW || 1); k.handR = B.handR * Math.sqrt(sq) * (ch.handS || 1);
    k.armL = B.armL * (.45 + .55 * hs); k.bootH = B.bootH * Math.sqrt(hs); k.bootL = B.bootL * sq;
    k.pF = [k.sw * .66, k.shY + k.armR * .95]; k.pB = [-k.sw * .6, k.shY + k.armR * .95];
    k.aF = ch.aF != null ? ch.aF : -.2; k.aB = ch.aB != null ? ch.aB : .1;
    const dir = a => [-Math.sin(a), Math.cos(a)];
    k.dF = dir(k.aF); k.dB = dir(k.aB);
    k.hF = [k.pF[0] + k.dF[0] * k.armL, k.pF[1] + k.dF[1] * k.armL];
    k.hB = [k.pB[0] + k.dB[0] * k.armL, k.pB[1] + k.dB[1] * k.armL];
    k.hip = [0, k.hiY]; k.fx = k.hipW * .46; k.bx = -k.hipW * .44;
    const po = k.pose;
    k.xf = (x, y, bone) => {
      let X = x, Y = y, b = bone;
      if (b === 'wF') { [X, Y] = rotP(X, Y, k.hF, po.wF); b = 'armF'; }
      if (b === 'wB') { [X, Y] = rotP(X, Y, k.hB, po.wB); b = 'armB'; }
      if (b === 'armF') { [X, Y] = rotP(X, Y, k.pF, po.rF); b = 'up'; }
      if (b === 'armB') { [X, Y] = rotP(X, Y, k.pB, po.rB); b = 'up'; }
      if (b === 'head') { Y += po.hb; b = 'up'; }
      if (b === 'up') { [X, Y] = rotP(X, Y, k.hip, po.lean); Y += po.bob; }
      X += po.dx; Y += po.dy;
      if (po.fall) [X, Y] = rotP(X, Y, [0, 0], po.fall);
      return [X, Y];
    };
    k.ang = bone => (bone === 'wF' ? po.wF + po.rF + po.lean : bone === 'wB' ? po.wB + po.rB + po.lean : bone === 'armF' ? po.rF + po.lean : bone === 'armB' ? po.rB + po.lean : bone === 'up' || bone === 'head' ? po.lean : 0) + po.fall;
    // Add one piece. z: layer (0 back ... 8 front). bone: legs | up | head | armF | armB | wF | wB.
    // opt: { g group (pieces in one group share no lines), sep (line even against the same material),
    //   nl (makes no line or cast shadow on what is under it), nlu (gets no line), clip: part (only
    //   inside it; shares its volume), bev (bevel scale), flat, tone (+1 darker, -1 lighter),
    //   lr (light radius, glow only), pulse, nolight }
    k.add = (z, bone, mat, s, o = {}) => { const p = { z, ord: k.ord++, bone, m: mat, s: mapShape(s, (x, y) => k.xf(x, y, bone), k.ang(bone)), o }; k.parts.push(p); return p; };
    // Pieces in a held item's frame: origin at the hand, -y points along the item; tilt is clockwise.
    k.held = (z, side, tilt, items) => { const hnd = side === 'F' ? k.hF : k.hB; const bone = 'w' + side; const out = []; for (const it of items) { if (!it) continue; const [mat, s, o] = it; if (!mat) continue; const w = mapShape(s, (x, y) => { const [X, Y] = rotP(x, y, [0, 0], tilt); return [X + hnd[0], Y + hnd[1]]; }, tilt); out.push(k.add(z + out.length * 0.001, bone, mat, w, o || {})); } return out; };
    k.U = n => Math.max(1, n * U);
    return k;
  }

  // ================= body pieces =================
  // Legs and boots. o: { flare, cuff: mat, toe: mat, sole: mat, greave: mat, patch: mat }
  function legs(k, tr, boot, o = {}) {
    const { legR, bootH, bootL, hiY, u } = k; const res = {};
    for (const side of ['B', 'F']) {
      const x = side === 'F' ? k.fx : k.bx, z = side === 'B' ? 1.8 : 2, lx = x + (side === 'F' ? .35 : -.3) * u;
      if (tr) res['leg' + side] = k.add(z, 'legs', tr, C(x, hiY - legR * .2, legR * 1.06, lx, -bootH * .85, legR * .92), { g: 'legs' });
      const r = legR * 1.2, fl = o.flare || 1, bh = bootH * (o.tall || 1);
      res['boot' + side] = k.add(z + .05, 'legs', boot, P(lx - r * fl, -bh, lx + r * fl, -bh, lx + r * 1.05, -bootH * .5, lx + r + bootL * .75, -bootH * .44, lx + r + bootL, -bootH * .16, lx + r + bootL, 0, lx - r * 1.12, 0, lx - r * 1.18, -bootH * .35), { bev: .7, sep: 1 });
      if (o.cuff) res['cuff' + side] = k.add(z + .06, 'legs', o.cuff, P(lx - r * 1.3, -bh - k.U(1.2), lx + r * 1.3, -bh - k.U(1.2), lx + r * 1.2, -bh + k.U(1.3), lx - r * 1.2, -bh + k.U(1.3)));
      if (o.toe) k.add(z + .07, 'legs', o.toe, P(lx + r + bootL * .2, -bootH * .5, lx + r + bootL, -bootH * .2, lx + r + bootL, 0, lx + r * .6, 0), { clip: res['boot' + side] });
      if (o.sole) k.add(z + .07, 'legs', o.sole, R(lx - r * 2, -k.U(1), r * 4 + bootL, k.U(1)), { clip: res['boot' + side] });
      if (o.greave) { k.add(z + .04, 'legs', o.greave, C(lx, hiY * .52, legR * 1.2, lx, -bh * .8, legR * 1.1)); k.add(z + .045, 'legs', o.greave, E(lx + .4 * u, hiY * .52, legR * 1.3, legR * 1.05)); }
      if (o.patch && side === 'F') k.add(z + .03, 'legs', o.patch, Q(lx - 1, hiY * .5, k.U(2), k.U(2)));
    }
    return res;
  }
  // Torso outline. o: { top, bot, sw, ww (waist), bw (bottom), dx }
  function torsoShape(k, o = {}) {
    const top = o.top != null ? o.top : k.shY, bot = o.bot != null ? o.bot : k.hiY + k.legR * .6, sw = (o.sw || 1) * k.sw, ww = (o.ww || .84) * k.sw, bw = (o.bw || 1.08) * k.hipW, u = k.u, dx = o.dx || 0;
    return P(-sw * .82 + dx, top, sw * .86 + dx, top, sw + dx, top + 2 * u, ww + dx, k.waY, bw + dx, bot, -bw + dx, bot, -ww + dx, k.waY, -sw + dx, top + 2 * u);
  }
  // Robe / dress / long coat: from the shoulders to hem (y), flaring. o: { hem, flare, bev }
  function robeShape(k, o = {}) {
    const hem = o.hem != null ? o.hem : -k.bootH * .55, fl = o.flare || 1, u = k.u;
    return P(-k.sw * .82, k.shY, k.sw * .86, k.shY, k.sw, k.shY + 2 * u, k.sw * .8, k.waY, k.hipW * 1.35 * fl, k.hiY * .3, k.hipW * 1.75 * fl, hem, -k.hipW * 1.6 * fl, hem, -k.hipW * 1.3 * fl, k.hiY * .3, -k.sw * .8, k.waY, -k.sw, k.shY + 2 * u);
  }
  // One arm: sleeve, optional rolled sleeve with bare forearm, bell sleeve, bracer, cuff and hand.
  // o: { bare: skinMat, bell: mat, bellTrim: mat, bracer: mat, cuff: mat, noHand, big }
  function arm(k, side, sleeve, hand, o = {}) {
    const piv = side === 'F' ? k.pF : k.pB, hd = side === 'F' ? k.hF : k.hB, d = side === 'F' ? k.dF : k.dB, bone = 'arm' + side, z = side === 'F' ? 6 : 1, r = k.armR;
    const wrist = [hd[0] - d[0] * k.handR * .75, hd[1] - d[1] * k.handR * .75], elbow = [(piv[0] + wrist[0]) / 2 + (side === 'F' ? .2 : 0), (piv[1] + wrist[1]) / 2];
    const res = {};
    if (o.bare) {
      res.fore = k.add(z, bone, o.bare, C(elbow[0], elbow[1], r * 1.05, wrist[0], wrist[1], r * .95), { g: 'skin' + side });
      res.sleeve = k.add(z + .02, bone, sleeve, C(piv[0], piv[1], r * 1.08, elbow[0], elbow[1] - k.U(.5), r * 1.02));
      res.roll = k.add(z + .03, bone, sleeve, C(elbow[0] - d[0] * k.U(1), elbow[1] - d[1] * k.U(1), r * 1.25, elbow[0], elbow[1], r * 1.2), { sep: 1 });
    } else res.sleeve = k.add(z, bone, sleeve, C(piv[0], piv[1], r * 1.06, wrist[0], wrist[1], r * .9));
    if (o.bell) res.bell = k.add(z + .03, bone, o.bell, P(elbow[0] - r * .9, elbow[1], elbow[0] + r * .9, elbow[1], wrist[0] + r * 1.7, wrist[1] + k.U(.5), wrist[0] - r * 1.5, wrist[1] + k.U(.5)));
    if (o.bellTrim) k.add(z + .04, bone, o.bellTrim, R(wrist[0] - r * 2, wrist[1] - k.U(1), r * 4, k.U(1.6)), { clip: res.bell });
    if (o.bracer) res.bracer = k.add(z + .03, bone, o.bracer, C(elbow[0] + d[0] * k.U(1), elbow[1] + d[1] * k.U(1), r * 1.14, wrist[0], wrist[1], r * 1.08), { sep: 1 });
    if (o.cuff) res.cuff = k.add(z + .05, bone, o.cuff, C(wrist[0] - d[0] * k.U(1.6), wrist[1] - d[1] * k.U(1.6), r * 1.28, wrist[0] + d[0] * k.U(.3), wrist[1] + d[1] * k.U(.3), r * 1.3), { sep: 1 });
    if (!o.noHand) res.hand = k.add(z + .06, bone, hand, E(hd[0], hd[1], k.handR * (o.big || 1), k.handR * 1.08 * (o.big || 1)), { sep: 1 });
    res.wrist = wrist; res.elbow = elbow;
    return res;
  }
  // Neck and head (skin). o: { noNeck }
  function head(k, skin, o = {}) {
    const { hx, hy, hw, hh, u } = k;
    if (!o.noNeck) k.add(3.9, 'up', skin, C(hx - .3 * u, k.chin - 1.5 * u, hw * .3, hx - .3 * u, k.shY + 1 * u, hw * .32), { g: 'skin' });
    return k.add(4, 'head', skin, E(hx, hy, hw, hh), { g: 'skin' });
  }
  // Face stamps: whole pixels relative to the head centre, so eyes never blur or vanish.
  // o: { eye: '#hex', brow: '#hex', glow: '#hex' (lit eyes, e.g. under a hood), one: true (one eye),
  //      mouth: '#hex', beard: mat (drawn by beard()), dx, dy (nudge in whole px) }
  function face(k, o = {}) {
    const { hx, hy, hw, hh } = k, Z = 4.6, fo = { nl: 1, g: 'face' };
    const ey = Math.round(hy - hh * .05) + (o.dy || 0), e1 = Math.round(hx + hw * .48) + (o.dx || 0), e0 = Math.round(hx - hw * .08) + (o.dx || 0);
    k.face = { ey, e0, e1 };
    if (o.glow) {
      const g = m(o.glow, 'glow', { light: o.glow });
      if (!o.one) k.add(Z, 'head', g, Q(e0, ey, 1, 1), { nl: 1, g: 'face', lr: 6 });
      k.add(Z, 'head', g, Q(e1, ey, 1, 1), { nl: 1, g: 'face', lr: 6 });
      return;
    }
    const eye = m(o.eye || '#2A1A22', 'flat');
    if (!o.one) k.add(Z, 'head', eye, Q(e0, ey, 1, 2), fo);
    k.add(Z, 'head', eye, Q(e1, ey, 1, 2), fo);
    if (o.brow) k.add(Z, 'head', m(o.brow, 'flat'), Q(e1 - 1, ey - 1 - (o.browUp || 0), 2, 1), fo);
    if (o.mouth) k.add(Z, 'head', m(o.mouth, 'flat'), Q(e1 - 1, ey + 3, 2, 1), fo);
  }
  // Short hair cap (fringe over the brow). o: { long: 1.3 (hair down the back), z }
  function hairShort(k, hair, o = {}) {
    const { hx, hy, hw, hh, u } = k;
    const cap = k.add(4.2, 'head', hair, P(arcPts(hx - hw * .05, hy + hh * .02, hw * 1.08, hh * 1.1, Math.PI * .92, Math.PI * 2.02, 12), hx + hw * .95, hy - hh * .28, hx + hw * .55, hy - hh * .5, hx + hw * .35, hy - hh * .22, hx + hw * .05, hy - hh * .42, hx - hw * .2, hy - hh * .1, hx - hw * .38, hy + hh * .35, hx - hw * .7, hy + hh * .75), { sep: 1 });
    if (o.long) k.add(.5, 'head', hair, P(hx - hw * 1.02, hy - hh * .1, hx - hw * .1, hy - hh * .5, hx + hw * .1, hy + hh * .4, hx - hw * .1, hy + hh * 1.9 + (o.long - 1) * 4 * u, hx - hw * .7, hy + hh * 2.1 + (o.long - 1) * 4 * u, hx - hw * 1.15, hy + hh * 1.4));
    return cap;
  }
  // Bald head with a fringe of hair round the back (tonsure / old man). o: { top: true (a few hairs on top) }
  function hairFringe(k, hair) {
    const { hx, hy, hw, hh } = k;
    return k.add(4.2, 'head', hair, P(hx - hw * 1.08, hy - hh * .2, hx - hw * .55, hy - hh * .62, hx - hw * .2, hy - hh * .35, hx - hw * .35, hy + hh * .2, hx - hw * .15, hy + hh * .55, hx - hw * .75, hy + hh * .85, hx - hw * 1.1, hy + hh * .35), { sep: 1 });
  }
  // Beard over the jaw, in front of the face. o: { long }
  function beard(k, hair, o = {}) {
    const { hx, hy, hw, hh } = k, L = o.long || 1;
    return k.add(4.4, 'head', hair, P(hx - hw * .25, hy + hh * .2, hx + hw * .2, hy + hh * .45, hx + hw * .75, hy + hh * .3, hx + hw * 1.05, hy + hh * .25, hx + hw * .9, hy + hh * (.9 + .3 * L), hx + hw * .35, hy + hh * (1.25 + .45 * L), hx - hw * .15, hy + hh * (1.1 + .3 * L), hx - hw * .45, hy + hh * .7), { sep: 1 });
  }
  // Hood: a cowl ring around an open face (even-odd hole), a back drape and an optional peak.
  // o: { shadow: '#hex' face in shadow, trim: mat, peak: true }
  function hood(k, mat, o = {}) {
    const { hx, hy, hw, hh, u } = k;
    const ox = hx - hw * .12, oy = hy - hh * .02, orx = hw * 1.3, ory = hh * 1.26;
    const ix = hx + hw * .3, iy = hy + hh * .16, irx = hw * .8, iry = hh * .86;
    k.add(.3, 'up', mat, P(ox - orx * .9, oy + ory * .3, ox - orx * .2, oy + ory * .8, k.sw * .3, k.shY + 2 * u, -k.sw * .2, k.shY + (k.waY - k.shY) * .5, -k.sw * 1.05, k.shY + (k.waY - k.shY) * .45), { g: 'hood' });
    const ring = k.add(4.3, 'head', mat, P(arcPts(ox, oy, orx, ory, 0, Math.PI * 2, 22), arcPts(ix, iy, irx, iry, Math.PI * 2, 0, 18)), { bev: 1.2, g: 'hood' });
    if (o.peak) k.add(4.29, 'head', mat, P(ox - orx * .05, oy - ory * .85, ox - orx * 1.05, oy - ory * 1.3, ox - orx * .95, oy - ory * .2), { g: 'hood' });
    if (o.shadow) k.add(4.2, 'head', m(o.shadow, 'flat'), E(ix, iy, irx + .5, iry + .5), { nl: 1 });
    if (o.trim) k.add(4.32, 'head', o.trim, P(arcPts(ix, iy, irx + k.U(1), iry + k.U(1), 0, Math.PI * 2, 18), arcPts(ix, iy, irx, iry, Math.PI * 2, 0, 18)), { clip: ring });
    return ring;
  }
  // Belt across the waist with a buckle. o: { w: height, buckle: mat, x: buckle x }
  function belt(k, mat, o = {}) {
    const h = k.U(o.w || 2.2), y = k.waY - h / 2;
    const b = k.add(3.3, 'up', mat, R(-k.sw * (o.sw || .9), y, k.sw * 2 * (o.sw || .9), h));
    if (o.buckle) k.add(3.35, 'up', o.buckle, R(o.x != null ? o.x : k.sw * .12, y, k.U(1.6), h));
    return b;
  }
  // A small hanging lantern, as held items (use with k.held). s: size (art px); frame, glass mats.
  function lanternItems(s, frame, glass, o = {}) {
    return [
      [frame, R(-.4, -.5, .8, s * .5)],
      [frame, P(-s * .55, s * .45, s * .55, s * .45, s * .4, s * .2, -s * .4, s * .2)],
      [glass, R(-s * .42, s * .45, s * .84, s * 1.05), { lr: o.lr || 20, pulse: o.pulse !== false }],
      [frame, R(-s * .55, s * 1.5, s * 1.1, 1.1)]
    ];
  }

  // ================= poses per attack animation =================
  // wind / strike pose values (see POSE0). idle1 is { bob: 1 } for everyone.
  const ANIMS = {
    slash: { wind: { rF: 2.3, wF: -.2, lean: -.1, rB: -.15 }, strike: { rF: -1.35, wF: 1.25, lean: .14, dx: 3, rB: .1 } },
    heavy: { wind: { rF: 2.2, rB: 1.9, wF: .9, lean: -.14 }, strike: { rF: -.6, rB: -.4, wF: -.9, lean: .2, dx: 3, bob: 1 } },
    cast: { wind: { rF: -.35, wF: .35, rB: -.25, wB: .25, lean: -.05 }, strike: { rF: -1.25, wF: .95, rB: -.2, wB: .2, lean: .08, dx: 1 } },
    lift: { wind: { rF: -.3, rB: -.3, wF: .3, wB: .3, bob: 1 }, strike: { rF: -1.15, rB: -1.1, wF: 1.15, wB: 1.1, dy: -1, lean: -.04 } },
    twin: { wind: { rF: 1.8, rB: 1.1, wF: -.2, lean: -.12 }, strike: { rF: -1.5, rB: -1.2, wF: 1.1, wB: .9, lean: .22, dx: 5 } },
    bash: { wind: { rF: 2.2, wF: -.2, lean: -.08, dx: -1 }, strike: { rF: -1.2, wF: 1.1, lean: .12, dx: 4, rB: -.15 } },
    shoot: { wind: { rB: -1.4, wB: 1.4, rF: -.75, lean: -.06, drawn: 1 }, strike: { rB: -1.35, wB: 1.35, rF: .5, lean: .04 } },
    swing: { wind: { rF: 1.2, wF: -.4, lean: -.08 }, strike: { rF: -1.3, wF: 1.2, lean: .1, dx: 2 } },
    thrust: { wind: { rF: .9, wF: -.9, lean: -.12, dx: -2 }, strike: { rF: -1.2, wF: 1.2, lean: .2, dx: 5 } },
    chop: { wind: { rF: 2.6, wF: .2, lean: -.15, rB: .4 }, strike: { rF: -.9, wF: .4, lean: .22, dx: 3, bob: 1 } }
  };
  const DOWN = { fall: -1.48, rF: .5, rB: -.4, hb: .5 };

  const CLASSES = {}, CHARS = {};
  return {
    toHsl, hsl, toward, mix, lift, hueShift, rgbOf, INK, ramp3, m, FAM, GOLD, SILVER, gearMats, SKINS, HAIRS,
    E, P, C, R, Q, arcPts, ringP, rrect, blob, rotP, mapShape, shapeBox,
    BODY, H, POSE0, makeKit, legs, torsoShape, robeShape, arm, head, face, hairShort, hairFringe, beard, hood, belt, lanternItems,
    ANIMS, DOWN, CLASSES, CHARS
  };
})();
// Compat for older callers (75-unlocks-ui checks RIG.COMPANIONS[id] before asking for a portrait).
const RIG = { COMPANIONS: AK.CHARS, CLASSES: AK.CLASSES, FAM: AK.FAM, SKINS: AK.SKINS, HAIRS: AK.HAIRS, SLOT_KEYS: ['weapon', 'off', 'head', 'body', 'charm'] };
