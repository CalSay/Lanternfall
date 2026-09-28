// map-study/style-b.js: candidate B, "Lampwright's chart". An old parchment map drawn in sepia ink
// (tree marks, hill hatching, ripple lines, a ruled road), with crisp B1 pixel landmarks set on it
// like stickers (ink outline plus a pale cut edge). The chart is only COLOURED where the lamps are
// lit: past your last lamp it is bare ink on smoke-stained paper. Lit lamps are gold leaf.
'use strict';
const STYLE_B = (() => {
  const { INK, mix, mul, desat, rand, Spr, fromMap, relight } = MK;
  const K = '#2E2018', K2 = '#6A5238';                         // ink, light ink
  const PAPER = ['#EADAB0', '#DCC897', '#C9B07C', '#A88C5C'];  // light, base, stain, burn
  const CUT = '#F6EBCB';                                       // the pale cut edge round a sticker
  const P = {
    k: INK, K, j: K2,
    W: '#B98450', w: '#8A5A34', v: '#5E3A24', V: '#3A2418',
    R: '#C8563E', r: '#9A3A30', q: '#6A2428',
    C: '#F4E8C6', c: '#D4BE90', n: '#A08660', N: '#6A5436',
    S: '#B8B0B4', s: '#8A8290', t: '#5E566A', T: '#3E3848',
    F: '#FFF3C4', f: '#FFD27A', o: '#FF9E3D', e: '#E0524F',
    d: '#8A8478', D: '#5E574C',
    I: '#7A7488', i: '#3E3850',
    G: '#8FB070', g: '#6A8E52', h: '#4A6A40',
    B: '#E0FCFF', b: '#7FE0EC', u: '#2F7A98', U: '#173A58',
    Y: '#FFE890', y: '#E8B84A', a: '#A8762A', A: '#6A4418',
    P: '#F4EAD2', p: '#CDBFA4', x: '#241A1E', m: '#4A3A30',
    M: '#9A3040', z: '#5A1A26', Z: '#D05A52', l: '#E0B080', X: '#EDE0C4'
  };
  const S = (rows, o) => fromMap(rows, Object.assign({}, P, o));
  const sticker = s => s.outlined(INK).outlined(CUT);

  // ================= landmarks (front elevation, sticker cut) =================
  function rest() {
    const s = new Spr(42, 28);
    // a low palisade arc behind the camp
    for (let i = 0; i < 18; i++) { const x = 1 + i * 2.3, h = 3 + Math.round(Math.sin(i / 17 * Math.PI) * 2), top = 14 - h - Math.round(Math.sin(i / 17 * Math.PI) * 4); s.rect(Math.round(x), top + 1, 2, h + 1, i % 2 ? P.v : P.w); s.set(Math.round(x), top, P.v); s.vl(Math.round(x) + 1, top + 1, h + 1, P.V); }
    // lantern pole (left)
    s.vl(3, 3, 20, P.V); s.vl(4, 3, 20, P.w); s.hl(3, 3, 6, P.w); s.map(['iii', 'fFf', 'ofo', 'iii'], P, 7, 4);
    s.light(8, 6, 12, '#FFBA60', { warm: 10, glow: 14 });
    // a big tent (left of centre) and a small red one (right)
    s.poly([16, 6, 27, 22, 5, 22], (px) => px < 16 ? P.C : P.c); s.vl(16, 6, 16, P.V); s.poly([16, 13, 20, 22, 12, 22], P.x); s.hl(5, 22, 23, P.n); s.rect(17, 4, 3, 2, P.e); s.set(16, 5, P.V);
    s.poly([33, 11, 41, 22, 25, 22], (px) => px < 33 ? P.R : P.r); s.vl(33, 11, 11, P.q); s.poly([33, 16, 36, 22, 30, 22], P.x); s.hl(25, 22, 17, P.q);
    // the fire in front
    s.map(['....F.....', '...fo..f..', '..ofFo.o..', '..oFFfoo..', '.eoFFFfoe.', '.eofFFfoe.', 'SwwWwwWwvS', 'stSvvvvtSt'], P, 17, 17);
    s.light(22, 21, 24, '#FF9A48', { warm: 18, glow: 26, ga: 0.7 });
    for (let x = 0; x < 42; x++) { s.set(x, 25, P.N); if (x % 3 === 0) s.set(x, 26, P.N); }
    return sticker(s);
  }
  function tavern() {
    const s = new Spr(24, 28);
    // chimney, steep roof
    s.rect(16, 0, 3, 7, P.t); s.vl(16, 0, 7, P.s); s.hl(15, 0, 5, P.T);
    s.poly([12, 1, 24, 11, 0, 11], (x, y) => x < 12 ? P.R : P.r); for (let y = 4; y < 11; y += 3) for (let x = 0; x < 24; x++) if (s.get(x, y)) s.set(x, y, P.q);
    s.hl(0, 11, 24, P.q);
    // upper storey: white plaster, dark beams (timber frame)
    s.rect(2, 12, 20, 7, P.X); s.vl(2, 12, 7, P.V); s.vl(21, 12, 7, P.V); s.vl(11, 12, 7, P.V); s.hl(2, 12, 20, P.V); s.hl(2, 18, 20, P.V);
    s.line(3, 13, 10, 17, P.v); s.line(12, 17, 20, 13, P.v);
    s.rect(5, 14, 3, 3, P.f); s.set(5, 14, P.F); s.rect(15, 14, 3, 3, P.f); s.set(15, 14, P.F);
    // ground floor: stone, door, window
    s.rect(2, 19, 20, 8, P.s); for (let y = 20; y < 27; y += 2) for (let x = 2 + (y % 4 ? 0 : 2); x < 22; x += 4) s.set(x, y, P.t); s.vl(21, 19, 8, P.t);
    s.rect(9, 20, 6, 7, P.x); s.rect(9, 20, 6, 1, P.V); s.set(13, 23, P.y);
    s.rect(4, 21, 3, 3, P.f); s.set(4, 21, P.F); s.hl(3, 24, 5, P.V);
    // sign on a bracket: gold mug
    s.hl(22, 13, 2, P.V); s.rect(19, 15, 5, 5, P.V); s.map(['yy.', 'Yya', 'yya'], P, 20, 16);
    s.light(6, 15, 9, '#FFBA60', { warm: 8, glow: 9 }); s.light(16, 15, 9, '#FFBA60', { warm: 8, glow: 9 }); s.light(5, 22, 9, '#FFBA60', { warm: 8, glow: 9 });
    return sticker(s);
  }
  function well() {
    const s = new Spr(22, 26);
    // a thick stone arch over the shaft, a pulley and rope
    s.rect(1, 6, 4, 12, P.S); s.vl(4, 6, 12, P.s); s.rect(17, 6, 4, 12, P.s); s.vl(20, 6, 12, P.t);
    for (let x = 1; x < 21; x++) { const top = 6 - Math.round(Math.sqrt(Math.max(0, 1 - ((x - 10.5) / 10) ** 2)) * 5); s.vl(x, top, 4, x < 11 ? P.S : P.s); s.set(x, top, P.S); s.set(x, top + 3, P.t); }
    for (const x of [3, 7, 11, 15, 18]) { const top = 6 - Math.round(Math.sqrt(Math.max(0, 1 - ((x - 10.5) / 10) ** 2)) * 5); s.vl(x, top, 3, P.t); }
    s.rect(9, 5, 4, 3, P.i); s.set(10, 6, P.I); s.vl(11, 8, 5, P.p); s.rect(10, 12, 3, 3, P.w); s.hl(10, 12, 3, P.W);
    // blue light rising from the shaft: one soft column and a few sparks
    s.rect(7, 9, 2, 6, P.b); s.rect(13, 9, 2, 6, P.b); s.vl(9, 11, 4, P.B); s.set(6, 7, P.B); s.set(15, 8, P.B); s.set(8, 8, P.b);
    // the mouth and the front band of stone blocks
    s.rect(0, 15, 22, 3, P.U); s.hl(2, 15, 18, P.u); s.hl(4, 16, 14, P.b);
    for (let x = 0; x < 22; x++) s.vl(x, 18, 7, (Math.floor(x / 4) % 2) ? P.s : P.S); for (let x = 3; x < 22; x += 4) s.vl(x, 18, 7, P.t); s.hl(0, 21, 22, P.t); s.hl(0, 24, 22, P.T);
    s.light(11, 14, 18, '#6FD0E8', { warm: 14, wy: 0.6, glow: 22, ga: 0.65 });
    return sticker(s);
  }
  function greatLantern(lit, col) {
    const s = new Spr(22, 36), g1 = lit ? P.F : P.d, g2 = lit ? P.f : P.D;
    // gold rays when lit (gold leaf on the chart)
    if (lit) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [-0.7, -0.7], [0.7, -0.7]]) for (let k = 7; k < 11; k++) s.set(11 + dx * k, 9 + dy * k, k % 2 ? P.Y : P.y);
    // lantern room
    s.poly([11, 1, 16, 5, 6, 5], P.y); s.hl(6, 5, 11, P.a); s.set(11, 0, P.y);
    s.rect(7, 6, 9, 8, g2); s.rect(8, 7, 4, 6, g1); for (const x of [7, 11, 15]) s.vl(x, 6, 8, P.a); s.hl(6, 14, 11, P.a);
    // tower: tapering stone, a band, a door
    s.poly([7, 15, 16, 15, 18, 33, 5, 33], (x, y) => x < 10 ? P.S : x < 14 ? P.s : P.t);
    s.hl(6, 22, 12, P.T); s.hl(6, 23, 12, P.y); s.rect(10, 28, 3, 5, P.x); s.hl(10, 28, 3, P.T);
    s.rect(3, 33, 17, 3, P.t); s.hl(3, 33, 17, P.s);
    if (lit) s.light(11, 10, 40, col || '#FFD27A', { warm: 22, glow: 40, ga: 0.7 });
    return sticker(s);
  }
  function sign() {
    const s = new Spr(20, 22);
    s.rect(9, 2, 2, 20, P.w); s.vl(10, 2, 20, P.v);
    s.poly([1, 3, 15, 3, 18, 5.5, 15, 8, 1, 8], P.W); s.hl(1, 7, 15, P.v); s.hl(3, 5, 9, P.V);
    s.poly([19, 9, 5, 9, 2, 11.5, 5, 14, 19, 14], P.w); s.hl(5, 13, 14, P.v); s.hl(7, 11, 9, P.V);
    // a nailed page with a red wax dot
    s.rect(4, 15, 7, 6, P.P); s.hl(5, 16, 5, P.j); s.hl(5, 18, 4, P.j); s.set(10, 20, P.p); s.set(7, 15, P.e);
    return sticker(s);
  }
  // "Here be dragons": the Ashen Wyrm drawn as the chart's sea-monster, in red and ink.
  function wyrm() {
    const s = new Spr(32, 24);
    // the body: one thick arc diving in and out of the ground, dorsal spikes, a curled tail
    const by = x => 17 - Math.round(Math.sin((x - 4) / 24 * Math.PI * 2) * 4);
    for (let x = 5; x < 29; x++) { const y = by(x), under = y >= 17 && x > 9 && x < 16; if (under) continue; s.set(x, y - 1, P.Z); s.set(x, y, P.M); s.set(x, y + 1, P.M); s.set(x, y + 2, P.z); if (x % 3 === 0) s.set(x, y - 2, P.y); }
    s.set(29, by(29) - 1, P.M); s.set(30, by(29) - 2, P.z); s.set(30, by(29) - 3, P.M);
    for (let x = 1; x < 31; x++) if (x % 3 !== 1) s.set(x, 20, P.K);
    // wing over the back hump
    s.poly([19, 12, 21, 2, 24, 6, 27, 1, 29, 9, 26, 13], P.q); s.line(21, 2, 21, 12, P.z); s.line(27, 1, 25, 12, P.z); s.poly([21, 4, 22, 11, 20, 12], P.Z); s.poly([27, 3, 26, 12, 23, 12], P.r);
    // neck up to the head (left), fire from the jaw
    s.line(6, 15, 5, 8, P.M, 3); s.blob(5, 6, 4, 3, [P.Z, P.M, P.z]); s.rect(0, 6, 3, 2, P.M); s.hl(0, 8, 3, P.z);
    s.set(0, 9, P.f); s.set(1, 9, P.o); s.set(0, 10, P.o);
    s.set(5, 5, P.F); s.set(6, 5, P.f); s.line(7, 3, 10, 1, P.P); s.line(6, 3, 7, 0, P.p);
    s.light(1, 9, 12, '#FF6B3D', { warm: 8, glow: 14, ga: 0.8 });
    return sticker(s);
  }
  function horn() { return sticker(S(['..........yY', '.........yya', '........yya.', '.....aaaya..', '...aaAyya...', '..aAyyya....', '.aAyyya.....', '.Ayyyy......', 'AYyyya......', 'Ayyya.......', '.AAa........'])); }
  // road lamps: gold leaf when lit, bare ink when dark
  function lamp(lit) {
    const s = lit
      ? S(['...Y...', '..yYy..', '.yFFfy.', '.yFfoy.', '.yfooa.', '..yaa..', '...a...', '...a...', '..aaa..'])
      : S(['...K...', '..KKK..', '.K...K.', '.K...K.', '.K...K.', '..KKK..', '...K...', '...K...', '..KKK..']);
    if (lit) { s.set(0, 3, P.y); s.set(6, 3, P.y); s.set(3, -1, P.y); s.light(3, 3, 11, '#FFBA60', { warm: 9, glow: 10 }); }
    return lit ? s.outlined(P.A) : s;
  }
  // You: a red wax map pin with the portrait in a gold-leaf rim
  function youFrame(portrait) {
    const s = new Spr(22, 28);
    s.ell(11, 11, 11, 11, P.q); s.ell(11, 11, 10, 10, P.e); s.ell(11, 11, 9, 9, P.y); s.ell(11, 11, 8.2, 8.2, P.x);
    s.vl(10, 21, 7, P.T); s.vl(11, 21, 7, P.s); s.set(11, 27, P.S);
    if (portrait) s.stamp(portrait, 3, 3);
    for (let y = 0; y < 22; y++) for (let x = 0; x < 22; x++) { const d = Math.hypot(x + 0.5 - 11, y + 0.5 - 11); if (d > 8.2 && d <= 9) s.set(x, y, P.y); if (d > 9 && d <= 10) s.set(x, y, d > 9.5 && x < 11 && y < 11 ? '#F07A6A' : P.e); if (d > 10 && d <= 11) s.set(x, y, P.q); }
    return sticker(s);
  }
  // a team out: a pennant token on a wax disc
  function team() {
    const s = new Spr(14, 18);
    s.vl(4, 0, 15, P.V); s.poly([5, 1, 13, 3.5, 5, 6], P.o); s.poly([5, 3, 11, 3.5, 5, 5], P.f);
    s.ell(5, 15, 5, 2.6, P.r); s.ell(5, 14.6, 4, 1.8, P.R); s.set(3, 14, '#F07A6A');
    return sticker(s);
  }
  function flag(open) {
    const c = open ? P.y : P.p, c2 = open ? P.Y : P.P;
    return S(['K......', 'KccccC.', 'KcCccc.', 'Kcccc..', 'Kcc.c..', 'Kc.....', 'K......', 'K......', 'KK.....'], { c, C: c2 }).outlined(open ? P.A : K2);
  }
  // locked region: a red wax seal with a padlock
  function gate() {
    const s = new Spr(18, 18);
    s.ell(9, 9, 9, 8.6, P.q); s.ell(9, 9, 8, 7.6, P.r); s.ell(8, 8, 6, 5.6, P.R); s.set(4, 4, '#F07A6A'); s.set(5, 3, '#F07A6A');
    s.rect(6, 8, 6, 5, P.q); s.hl(6, 8, 6, P.z); s.map(['.qq.', 'q..q', 'q..q'], P, 7, 5); s.set(9, 10, P.X);
    for (const [x, y] of [[0, 4], [17, 12], [2, 15], [15, 2]]) s.set(x, y, P.r);
    return sticker(s);
  }

  // ================= ink marks for the chart =================
  const TREE = ['.KKK.', 'K...K', 'K..jK', '.KKK.', '..K..'];
  const PINE = ['..K..', '.K.K.', '.KjK.', 'K...K', 'KKKKK', '..K..'];
  function parchment(W, H, seed, o) {
    o = o || {};
    const r = rand(seed), s = new Spr(W, H);
    const grid = (n, sx, sy) => { const g = []; for (let j = 0; j <= Math.ceil(H / sy) + 1; j++) { g[j] = []; for (let i = 0; i <= Math.ceil(W / sx) + 1; i++) g[j][i] = r(); } return (x, y) => { const gx = x / sx, gy = y / sy, i = Math.floor(gx), j = Math.floor(gy), fx = gx - i, fy = gy - j, sm = t => t * t * (3 - 2 * t); const a = g[j][i] + (g[j][i + 1] - g[j][i]) * sm(fx), b = g[j + 1][i] + (g[j + 1][i + 1] - g[j + 1][i]) * sm(fx); return a + (b - a) * sm(fy); }; };
    const n1 = grid(0, 26, 20), n2 = grid(0, 7, 6);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let n = n1(x, y) * 0.75 + n2(x, y) * 0.25;
      const ed = Math.min(x, W - 1 - x) / 10; if (ed < 1) n -= (1 - ed) * 0.35;   // browned side edges
      const tb = Math.min(y, H - 1 - y) / 8; if (tb < 1 && !o.noTorn) n -= (1 - tb) * 0.3;
      s.set(x, y, n > 0.6 ? PAPER[0] : n > 0.34 ? PAPER[1] : n > 0.16 ? PAPER[2] : PAPER[3]);
      if (r() < 0.012) s.set(x, y, PAPER[2]);
    }
    // torn top and bottom edges: the chart is one sheet per region
    if (!o.noTorn) for (let x = 0; x < W; x++) { const a = 1 + Math.round(r() * 1.6 + Math.sin(x / 5) * 0.8), b = 1 + Math.round(r() * 1.6 + Math.cos(x / 6) * 0.8); for (let k = 0; k < a; k++) s.set(x, k, null); s.set(x, a, PAPER[3]); for (let k = 0; k < b; k++) s.set(x, H - 1 - k, null); s.set(x, H - 1 - b, PAPER[3]); }
    return s;
  }

  // Paint one sheet: base = paper + ink (always), wash = colours where the land is lit.
  function chart(W, H, seed, draw, land) {
    const paper = parchment(W, H, seed), ink = new Spr(W, H), wash = new Spr(W, H);
    land = land || '#DCE8B4';   // the meadow wash every lit piece of land gets
    draw({ paper, ink, wash, r: rand(seed + 3) });
    const lit = new Spr(W, H), bare = new Spr(W, H);
    for (let i = 0; i < W * H; i++) {
      const p = paper.c[i]; if (p == null) continue;
      const k = ink.c[i], w = wash.c[i];
      bare.c[i] = k || p;
      lit.c[i] = k || mul(p, w || land);
    }
    return { lit, bare, ink, paper };
  }
  const soot = c => mix(desat(c, 0.45), '#3A2E26', 0.46);

  function roadInk(ink, wash, pts, W, H, col) {
    const band = new Spr(W, H);
    for (let i = 0; i + 1 < pts.length; i++) band.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 1, 5);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (band.get(x, y)) {
      const e = !band.get(x, y - 1) || !band.get(x - 1, y) || !band.get(x + 1, y) || !band.get(x, y + 1);
      if (e) ink.set(x, y, K); else wash.set(x, y, col || '#F0C890');
    }
    return band;
  }
  const HOLLOW = { places: { rest: [84, 40], tavern: [30, 46], well: [150, 84], sign: [108, 86], lantern: [152, 42] } };

  function paintHollow(save) {
    const W = 180, H = 300, rows = [110, 150, 190, 230, 270], xl = 20, xr = 160;
    const sn = MAPDATA.snake(rows, xl, xr, 1, [[84, 56], [84, 90], [xl, 90]], [[xr, H + 2]]);
    let band;
    const ch = chart(W, H, 21, ({ ink, wash, r }) => {
      // Lantern Hill: a big hatched hill, top right
      const hillTop = x => 44 - Math.round(Math.sqrt(Math.max(0, 1 - ((x - 152) / 44) ** 2)) * 30);
      for (let x = 108; x < W; x++) { const y0 = hillTop(x); ink.set(x, y0, K); if (x > 152 && x % 3 === 0) for (let k = 2; k < 8 + (x - 152) / 5; k += 2) ink.set(x - (k % 4 === 0 ? 1 : 0), y0 + k, K2); for (let y = y0 + 1; y < 46; y++) wash.set(x, y, '#C8D898'); }
      for (let x = 110; x < W; x++) if (x % 2 === 0) ink.set(x, 46, K2);
      // the camp clearing (a dotted ring) and the tavern yard
      for (let a = 0; a < 6.283; a += 0.07) ink.set(84 + Math.cos(a) * 32, 42 + Math.sin(a) * 19, K2);
      for (let y = 20; y < 64; y++) for (let x = 50; x < 118; x++) if (((x - 84) / 31) ** 2 + ((y - 42) / 18) ** 2 < 1) wash.set(x, y, '#F2D8A8');
      // marsh pond (bottom left): outline, ripples, reeds
      const pond = (x, y) => ((x - 18) / 28) ** 2 + ((y - 254) / 20) ** 2 <= 1;
      for (let y = 230; y < 280; y++) for (let x = 0; x < 50; x++) if (pond(x, y)) { if (!pond(x, y - 1) || !pond(x + 1, y) || !pond(x, y + 1) || !pond(x - 1, y)) ink.set(x, y, K); else { wash.set(x, y, '#A8C8D0'); if (y % 5 === 0 && (x + y) % 8 < 4) ink.set(x, y, K2); } }
      // stream from the hill to the pond (a ruled double line)
      const sx = y => Math.round(112 + Math.sin(y / 23) * 7 - (y - 60) * 0.1);
      for (let y = 46; y < 234; y++) { const x = sx(y); ink.set(x - 2, y, K2); ink.set(x + 2, y, K2); wash.rect(x - 1, y, 3, 1, '#A8C8D0'); if (y % 6 === 0) ink.set(x, y, K2); }
      band = roadInk(ink, wash, sn.pts, W, H);
      const busy = (x, y, p) => { for (let yy = y - p; yy <= y + p; yy++) for (let xx = x - p; xx <= x + p; xx++) if (band.get(xx, yy)) return true; return false; };
      const near = (x, y) => Object.values(HOLLOW.places).some(([px, py]) => Math.abs(px - x) < 22 && Math.abs(py - y) < 22);
      // forests: tree marks in drifts, green wash under them
      for (let i = 0; i < 1100; i++) {
        const x = Math.floor(r() * W), y = Math.floor(r() * H);
        const edge = x < 14 || x > W - 14 || (y < 24 && x < 60) || (y > 62 && y < 80 && (x < 40 || x > 128)), between = rows.some(ry => Math.abs(y - ry - 20) < 7) && r() < 0.5;
        if (!(edge || between) || busy(x, y + 3, 6) || near(x, y) || pond(x, y) || Math.abs(sx(y) - x) < 6 || (x > 108 && y < hillTop(x) + 2)) continue;
        const t = r() < 0.25 ? PINE : TREE; ink.map(t, P, x - 2, y - 2); wash.ell(x + 0.5, y + 0.5, 4, 4, c => '#B8D08C');
      }
      // hills (hatched humps), graves (crosses), barrows, mushrooms, a quarry, a compass
      const hump = (x, y, w) => { for (let i = -w; i <= w; i++) { const yy = y - Math.round(Math.sqrt(1 - (i / w) ** 2) * w * 0.6); ink.set(x + i, yy, K); if (i > 0 && i % 2 === 0) ink.vl(x + i, yy + 2, 2, K2); } };
      hump(62, 142, 6); hump(150, 214, 7); hump(128, 172, 5); hump(46, 214, 5);
      for (const [x, y] of [[134, 124], [141, 126], [148, 123], [138, 131], [145, 132]]) { ink.vl(x, y - 3, 5, K); ink.hl(x - 1, y - 2, 3, K); }
      for (const [x, y] of [[72, 216], [90, 218]]) { hump(x, y, 6); ink.rect(x - 1, y - 2, 3, 2, K); }
      for (const [x, y] of [[40, 170], [46, 174], [36, 176]]) { ink.hl(x - 1, y - 2, 3, '#9A3A30'); ink.hl(x - 2, y - 1, 5, '#9A3A30'); ink.vl(x, y, 2, K2); }
      for (let k = 0; k < 4; k++) { ink.hl(150 + k * 4, 242 + k * 3, 30 - k * 4, K); for (let x = 150 + k * 4; x < W; x += 3) ink.set(x, 243 + k * 3, K2); }
    });
    // lamps and lighting
    const pl = ch.lit, lamps = sn.lamps.map((l, i) => ({ ...l, zone: i + 1 })), lights = [];
    for (const l of lamps) {
      l.lit = l.zone < save.maxZone; const s = lamp(l.lit);
      pl.stamp(s, l.x - Math.floor(s.w / 2), l.y - s.h - 2); ch.bare.stamp(s, l.x - Math.floor(s.w / 2), l.y - s.h - 2);
      if (l.lit) lights.push({ x: l.x, y: l.y - 4, r: 25, warm: 12, wy: 0.6, col: '#FFC870' });
    }
    lights.push({ x: 84, y: 42, rx: 62, ry: 44, warm: 22, col: '#FFB050' }, { x: 30, y: 46, r: 30 }, { x: 150, y: 78, r: 24 }, { x: 108, y: 82, r: 20 });
    const allLit = !!(save.lit && save.lit.hollow);
    if (allLit) lights.push({ x: 152, y: 30, r: 70, warm: 34, col: '#FFD27A' });
    const out = relight(pl, lights, { dark: soot, darkPlate: ch.bare, edge: 6, dither: 1, allLit });
    const pins = [
      { id: 'rest', at: HOLLOW.places.rest, spr: rest(), label: "Hollow's Rest" },
      { id: 'tavern', at: HOLLOW.places.tavern, spr: tavern(), label: 'Tavern', dot: save.dots.tavern },
      { id: 'well', at: HOLLOW.places.well, spr: well(), label: 'Deepwell' },
      { id: 'sign', at: HOLLOW.places.sign, spr: sign(), label: 'Almanac', dot: save.dots.sign },
      { id: 'lantern', at: HOLLOW.places.lantern, spr: greatLantern(allLit, '#F2C14E'), label: 'Great Lantern' }
    ];
    return { plate: out, lamps, pins, rows, W, H, flags: rows.map((y, i) => ({ band: i, y, open: save.maxZone > i * 7 })), glowLights: pl.lights };
  }
  function paintCoast(save) {
    const W = 180, H = 236, rows = [40, 80, 120, 160, 200], xl = 62, xr = 162;
    const sn = MAPDATA.snake(rows, xl, xr, 0, [[160, -2], [160, 40]], [[xl, H + 2]]);
    const shore = y => 40 + Math.round(Math.sin(y / 17) * 6 + Math.sin(y / 7) * 2);
    const ch = chart(W, H, 33, ({ ink, wash, r }) => {
      for (let y = 0; y < H; y++) { const s = shore(y); ink.set(s, y, K); ink.set(s + 1, y, K2); for (let x = 0; x < s; x++) wash.set(x, y, '#9CC0CC'); if (y % 7 === 0) for (let x = 4 + (y % 14 ? 0 : 6); x < s - 5; x += 12) { ink.set(x, y, K2); ink.set(x + 1, y - 1, K2); ink.set(x + 2, y, K2); ink.set(x + 3, y - 1, K2); } }
      // a compass rose in the sea
      const cx = 20, cy = 60; for (let k = -8; k <= 8; k++) { ink.set(cx + k, cy, K2); ink.set(cx, cy + k, K2); } ink.map(['..K..', '.KyK.', 'KyYyK', '.KyK.', '..K..'], P, cx - 2, cy - 2); ink.set(cx, cy - 10, K); ink.map(['K.K', 'KKK', 'K.K'], P, cx - 1, cy - 15);
      const band = roadInk(ink, wash, sn.pts, W, H, '#EAD0A0');
      for (let i = 0; i < 300; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * H); if (x < shore(y) + 10) continue; let b = false; for (let yy = y - 5; yy <= y + 8 && !b; yy++) for (let xx = x - 5; xx <= x + 5; xx++) if (band.get(xx, yy)) { b = true; break; } if (b || !(x > W - 12 || rows.some(ry => Math.abs(y - ry - 20) < 6))) continue; ink.map(PINE, P, x - 2, y - 2); wash.ell(x + 0.5, y + 1, 3.5, 4, c => '#A8C498'); }
      // a wreck on the beach
      ink.line(46, 150, 54, 152, K); ink.line(47, 151, 49, 145, K); ink.line(51, 152, 53, 146, K);
    });
    const pl = ch.lit, lamps = sn.lamps.map((l, i) => ({ ...l, zone: 36 + i })), lights = [];
    for (const l of lamps) { l.lit = l.zone < save.maxZone; const s = lamp(l.lit); pl.stamp(s, l.x - Math.floor(s.w / 2), l.y - s.h - 2); ch.bare.stamp(s, l.x - Math.floor(s.w / 2), l.y - s.h - 2); if (l.lit) lights.push({ x: l.x, y: l.y - 4, r: 25, warm: 12, wy: 0.6, col: '#FFC870' }); }
    const out = relight(pl, lights, { dark: soot, darkPlate: ch.bare, edge: 6, dither: 1 });
    return { plate: out, lamps, pins: [{ id: 'lantern', at: [22, 212], spr: greatLantern(false), label: 'Great Lantern' }], rows, W, H, flags: rows.map((y, i) => ({ band: 5 + i, y, open: save.maxZone > 35 + i * 7 })), glowLights: pl.lights };
  }
  // Beyond: a blank sheet, folded and sealed. Only faint pencil marks and the road running out.
  function paintBeyond() {
    const W = 180, H = 84, pap = parchment(W, H, 55);
    const s = pap.recolor(c => mix(desat(c, 0.35), '#4E3E30', 0.3));
    for (let y = 2; y < H - 2; y++) s.set(90, y, mix(PAPER[3], '#4E3E30', 0.4));   // the fold
    for (let y = 0; y < 34; y += 3) { s.set(62, y, K2); s.set(66, y, K2); }
    for (let k = 0; k < 8; k++) s.set(58 - k * 3, 36 + k, K2);
    return { plate: s, lamps: [], rows: [], W, H, flags: [], glowLights: [], pins: [{ id: 'raid', at: [140, 52], spr: wyrm(), label: 'Raid: the Ashen Wyrm', dot: 1, lit: 1 }, { id: 'gate', at: [64, 44], spr: gate(), label: 'Reach zone 71', dim: 1 }] };
  }

  // ================= five regions =================
  const RW = [
    { land: '#DCE8B4', mark: 'tree' }, { land: '#D8E8D8', mark: 'pine', sea: '#9CC0CC' }, { land: '#F0C8A8', mark: 'dead' },
    { land: '#EEF2FA', mark: 'peak' }, { land: '#D8CCE8', mark: 'stair' }
  ];
  function regionTile(i, locked) {
    const R = RW[i], W = 60, H = 40;
    const ch = chart(W, H, 40 + i, ({ ink, wash, r }) => {
      if (R.sea) for (let y = 0; y < H; y++) { const e = 9 + Math.round(Math.sin(y / 5) * 2); ink.set(e, y, K); for (let x = 0; x < e; x++) { wash.set(x, y, R.sea); if (y % 6 === 0 && x % 6 === 2) { ink.set(x, y, K2); ink.set(x + 1, y - 1, K2); ink.set(x + 2, y, K2); } } }
      for (let x = 0; x < W; x++) { ink.set(x, 28, K); ink.set(x, 33, K); for (let y = 29; y < 33; y++) wash.set(x, y, '#F0C890'); }
      const marks = [[12, 12], [30, 8], [50, 14], [22, 20], [42, 20]];
      for (const [x, y] of marks) {
        if (R.sea && x < 14) continue;
        if (R.mark === 'tree') { ink.map(TREE, P, x - 2, y - 2); wash.ell(x + 0.5, y + 0.5, 4, 4, () => '#B8D08C'); }
        else if (R.mark === 'pine') { ink.map(PINE, P, x - 2, y - 2); wash.ell(x + 0.5, y + 1, 3.5, 4, () => '#A8C498'); }
        else if (R.mark === 'dead') { ink.vl(x, y - 3, 6, K); ink.line(x, y - 1, x - 2, y - 4, K); ink.line(x, y - 2, x + 2, y - 5, K); ink.set(x + 3, y + 3, '#B8442E'); ink.set(x - 3, y + 2, '#B8442E'); wash.ell(x, y + 2, 5, 2, () => '#E8B090'); }
        else if (R.mark === 'peak') { for (let k = 0; k < 6; k++) { ink.set(x - k, y - 4 + k, K); ink.set(x + k, y - 4 + k, K); if (k > 1 && k % 2 === 0) ink.hl(x + 1, y - 4 + k, k - 1, K2); } wash.poly([x, y - 4, x + 6, y + 2, x - 6, y + 2], '#E0E8F8'); }
        else { for (let k = 0; k < 4; k++) { ink.hl(x - 4 + k * 2, y - 4 + k * 2, 3, K); ink.vl(x - 2 + k * 2, y - 4 + k * 2, 2, K); } ink.set(x + 3, y - 5, '#8A6AC8'); wash.ell(x, y, 5, 4, () => '#C8B8E8'); }
      }
    }, R.land);
    const pl = ch.lit, a = lamp(!locked), b = lamp(false);
    for (const t of [pl, ch.bare]) { t.stamp(a, 18 - Math.floor(a.w / 2), 26 - a.h); t.stamp(b, 42 - Math.floor(b.w / 2), 26 - b.h); }
    if (locked) { const out = ch.bare.recolor(c => mix(desat(c, 0.6), '#2A2019', 0.55)); return { plate: out, glow: [], pins: [{ at: [30, 38], spr: gate() }] }; }
    const out = relight(pl, [{ x: 18, y: 24, r: 22, warm: 10, wy: 0.6, col: '#FFC870' }], { dark: soot, darkPlate: ch.bare, edge: 5, dither: 1 });
    return { plate: out, glow: pl.lights };
  }

  const sheet = portrait => [
    { name: "Hollow's Rest", note: 'low palisade, lantern pole, tents, the fire', spr: rest() },
    { name: 'The Tavern', note: 'timber frame, lit windows, mug sign', spr: tavern() },
    { name: 'The Deepwell', note: 'stone arch, pulley, blue light rising', spr: well() },
    { name: 'Great Lantern (lit)', note: 'tower with gold-leaf rays', spr: greatLantern(true, '#F2C14E') },
    { name: 'Great Lantern (dark)', note: 'grey glass, no rays', spr: greatLantern(false) },
    { name: 'Raid: the Ashen Wyrm', note: 'the chart\'s sea-monster, on land', spr: wyrm() },
    { name: 'War horn', note: 'raid pin, other foes', spr: horn(), size: '12 x 11' },
    { name: 'Almanac post', note: 'signpost with a nailed page', spr: sign() },
    { name: 'Road lamps', note: 'gold leaf (lit) / bare ink (dark)', spr: lamp(true), spr2: lamp(false), size: '7 x 9 / 5 x 9' },
    { name: 'You', note: 'red wax pin, gold-leaf rim', spr: youFrame(portrait) },
    { name: 'Team out', note: 'pennant token on a wax disc', spr: team() },
    { name: 'Band flag', note: 'gold leaf open / ink locked', spr: flag(true), spr2: flag(false), size: '7 x 9' },
    { name: 'Locked region', note: 'wax seal with a padlock', spr: gate() }
  ];
  const swatch = (w, h) => parchment(w, h, 9, { noTorn: 1 });
  return {
    key: 'B', name: "Lampwright's chart", pitch: 'An ink-and-parchment map with crisp B1 landmarks set on it like stickers. The chart is coloured only where your lamps are lit; the rest is bare ink on smoke-stained paper.',
    paintHollow, paintCoast, paintBeyond, sheet, swatch, youFrame, team, flag, glowK: 0.55, P, rim: 4, regionTile
  };
})();
