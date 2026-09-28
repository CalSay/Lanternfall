// map-study/style-a.js: candidate A, "Dusk overworld". A classic 16-bit JRPG world map seen from
// above at a 3/4 tilt: tiled grass, round-canopy forests, a cliff for Lantern Hill, a marsh pond,
// a dirt road. The land past your last lit lamp sits in the night palette; each lit lamp throws a
// banded pool of warm light. Landmarks are 3/4 buildings in B1 (3 tones, section lines, ink outline).
'use strict';
const STYLE_A = (() => {
  const { INK, mix, desat, ramp, rand, Spr, fromMap, relight } = MK;
  const P = {
    k: INK,
    W: '#C08A52', w: '#8E5E36', v: '#5E3A24', V: '#3A2418',
    R: '#DA6A4E', r: '#AC443A', q: '#76292E', Q: '#4A1A22',
    C: '#F4E8C6', c: '#D4BE90', n: '#A08660', N: '#6A5436',
    S: '#B8B0C2', s: '#88809C', t: '#5C5474', T: '#3A3450',
    F: '#FFF3C4', f: '#FFD27A', o: '#FF9E3D', e: '#E0524F',
    d: '#5A6072', D: '#3A3E50',
    I: '#7A7488', i: '#3E3850',
    G: '#6E9E52', g: '#4C7E40', h: '#35613A', H: '#22442E',
    B: '#E0FCFF', b: '#7FE0EC', u: '#2F7A98', U: '#173A58',
    Y: '#FFE08A', y: '#E4B44A', a: '#A8762A', A: '#6A4418',
    P: '#EFE6D6', p: '#C8BCA4', x: '#1E1826', m: '#4A3A30',
    M: '#8A3345', z: '#4A1A2A', Z: '#C85A5E', l: '#D8A070', j: '#5A2230', J: '#A0444E'
  };
  const S = (rows, o) => { const s = fromMap(rows, Object.assign({}, P, o)); return s; };

  // ================= small pieces =================
  const TENT = [
    '......V......',
    '.....CVc.....',
    '....CCVcc....',
    '...CCCVccc...',
    '..CCCCVcccn..',
    '.CCCCxVxcccn.',
    'CCCCxxVxxccnn',
    'CCCxxxxxxxcnn',
    'nnnxxxxxxxnNN'
  ];
  const TENT_RED = TENT.map(r => r.replace(/C/g, 'R').replace(/c/g, 'r').replace(/n/g, 'q').replace(/N/g, 'Q'));
  const FIRE = [
    '....F.....',
    '...fo..f..',
    '..ofFo.o..',
    '..oFFfoo..',
    '.eoFFFfoe.',
    '.eofFFfoe.',
    'SwwWwwWwvS',
    'stSvvvvtSt'
  ];
  const LAMP_LIT = [
    '.iii.',
    'iFfoi',
    'ifFfi',
    'ifffi',
    '.iIi.',
    '..I..',
    '..i..',
    '..i..',
    '..i..',
    '.tst.'
  ];
  const LAMP_DARK = LAMP_LIT.map(r => r.replace(/[Ff]/g, 'd').replace(/o/g, 'D'));
  function lamp(lit) { const s = S(lit ? LAMP_LIT : LAMP_DARK).outlined(); if (lit) s.light(3, 3, 11, '#FFBA60', { warm: 9, glow: 10 }); return s; }

  // ================= landmarks =================
  // Hollow's Rest: the command tent, two small tents, the fire, a lantern pole, a woodpile.
  function rest() {
    const s = new Spr(40, 27);
    // big tent (back, centre): wide canvas with a red pennant
    s.poly([20, 1, 31, 12, 9, 12], (x, y) => x < 20 ? P.C : P.c);
    s.poly([20, 1, 21, 1, 34, 12, 31, 12], P.n);
    s.vl(20, 1, 11, P.V); s.rect(17, 7, 7, 5, P.x); s.rect(18, 8, 1, 4, P.N); s.rect(22, 8, 1, 4, P.N);
    s.hl(9, 12, 26, P.N);
    s.vl(20, -1, 2, P.V); s.rect(21, -1, 3, 2, P.e); // pennant
    s.map(['V', 'Ve', 'Vee', 'V'], P, 20, 0);
    // small tents
    s.map(TENT, P, 1, 10); s.map(TENT_RED, P, 27, 11, true);
    // lantern pole (left) with a lit lantern
    s.vl(2, 1, 9, P.V); s.vl(3, 1, 9, P.w); s.hl(2, 1, 5, P.w); s.map(['iii', 'fFf', 'ofo', 'iii'], P, 5, 2);
    s.light(6, 4, 12, '#FFBA60', { warm: 10, glow: 14 });
    // the fire, front centre
    s.map(FIRE, P, 15, 17);
    s.light(20, 20, 26, '#FF9A48', { warm: 18, glow: 26, ga: 0.7 });
    // woodpile and a crate (right)
    s.map(['.WWw.', 'WvWvw', 'wVwVv'], P, 32, 22);
    s.map(['cccn', 'CccN', 'nnnN'], P, 1, 22);
    // stools (logs) round the fire
    s.map(['Ww', 'vv'], P, 11, 22); s.map(['Ww', 'vv'], P, 27, 22);
    return s.outlined();
  }
  // The Tavern: a timber house, red roof, lit windows, a mug sign, a chimney with smoke.
  function tavern() {
    const s = new Spr(26, 24);
    // chimney
    s.rect(5, 1, 3, 5, P.t); s.rect(5, 1, 1, 5, P.s); s.hl(4, 1, 5, P.T);
    s.set(6, -1, P.p);
    // roof: a gable seen from the front and above (ridge at the top, eave at the bottom)
    for (let y = 3; y < 12; y++) { const inset = Math.max(0, 3 - (y - 3)); s.hl(1 + inset, y, 24 - inset * 2, (y - 3) % 3 === 2 ? P.q : y < 6 ? P.R : P.r); }
    s.hl(4, 3, 18, P.R); s.hl(1, 11, 24, P.Q);
    s.poly([13, 4, 17, 9, 9, 9], P.q); s.poly([13, 5, 16, 9, 10, 9], P.W); s.map(['.f.', 'fFf', '.f.'], P, 12, 6); // gable window
    // wall: planks, door, two lit windows, a beam
    s.rect(2, 12, 22, 9, P.w); s.hl(2, 12, 22, P.v); s.vl(2, 12, 9, P.W); s.vl(23, 12, 9, P.v);
    for (const x of [7, 18]) s.vl(x, 13, 8, P.v);
    s.rect(11, 14, 5, 7, P.x); s.rect(11, 14, 5, 1, P.V); s.vl(15, 15, 6, P.m); s.set(12, 17, P.y);
    for (const x of [4, 19]) { s.rect(x, 14, 3, 3, P.f); s.set(x, 14, P.F); s.set(x + 1, 15, P.o); s.hl(x - 1, 17, 5, P.V); }
    s.hl(1, 21, 24, P.V);
    // hanging sign with a mug (gold mug on a dark board)
    s.hl(22, 12, 4, P.V); s.vl(25, 12, 1, P.V); s.rect(23, 13, 4, 5, P.V); s.map(['yy.', 'Yya', 'yya'], P, 23, 14);
    s.light(5, 16, 10, '#FFBA60', { warm: 10, glow: 10 }); s.light(20, 16, 10, '#FFBA60', { warm: 10, glow: 10 });
    return s.outlined();
  }
  // The Deepwell: a round stone mouth, a winch under a little roof, a blue glow from below.
  function well() {
    const s = new Spr(24, 24);
    // roof on two posts
    s.poly([12, 0, 22, 6, 2, 6], (x, y) => y < 3 ? P.R : P.r); s.hl(1, 6, 22, P.Q); s.hl(3, 5, 18, P.q);
    s.vl(4, 7, 9, P.w); s.vl(19, 7, 9, P.w); s.vl(5, 7, 9, P.v); s.vl(20, 7, 9, P.v);
    // winch and rope
    s.hl(4, 9, 17, P.W); s.hl(4, 10, 17, P.v); s.rect(20, 8, 2, 3, P.I); s.vl(12, 11, 4, P.p);
    // rim: stone ring (top face, then the front face in blocks)
    s.ell(12, 16, 10, 4, P.S); s.ell(12, 15.6, 7.5, 2.6, P.U); s.ell(12, 15.6, 5.5, 1.8, P.u); s.ell(12, 15.6, 3.2, 1.2, P.b); s.hl(11, 15, 2, P.B);
    for (let x = 2; x < 23; x++) { s.vl(x, 17, 4, (x % 4 === 1) ? P.t : x < 12 ? P.s : P.t); s.set(x, 18, P.T); }
    s.hl(3, 20, 19, P.T);
    s.vl(12, 11, 3, P.p); s.rect(11, 13, 3, 2, P.w);
    s.light(12, 15, 18, '#6FD0E8', { warm: 16, wy: 0.6, glow: 22, ga: 0.65 });
    return s.outlined();
  }
  // The Great Lantern on its plinth. lit: gold light over the hill; dark: cold glass.
  function greatLantern(lit, col) {
    const s = new Spr(16, 32), g1 = lit ? P.F : P.d, g2 = lit ? P.f : P.D, g3 = lit ? (col ? mix(col, '#FFD27A', 0.4) : P.o) : P.D;
    // ring and cap
    s.map(['..yyyy..', '.y....y.', '..yyyy..'], P, 4, 0);
    s.poly([8, 3, 14, 7, 2, 7], (x, y) => y < 5 ? P.Y : P.y); s.hl(2, 7, 13, P.a);
    // cage and glass
    s.rect(3, 8, 11, 11, g2); s.rect(5, 9, 6, 8, g1); s.rect(10, 9, 3, 8, g3); s.rect(6, 11, 3, 4, lit ? '#FFFFFF' : P.d);
    for (const x of [3, 8, 13]) s.vl(x, 8, 11, x === 13 ? P.a : P.y);
    s.hl(3, 13, 11, lit ? P.y : P.a); s.hl(2, 19, 13, P.a); s.hl(3, 18, 11, P.y);
    // column and plinth
    s.rect(5, 20, 7, 6, P.s); s.rect(5, 20, 2, 6, P.S); s.vl(11, 20, 6, P.t); s.hl(5, 20, 7, P.T);
    s.rect(2, 26, 13, 3, P.s); s.rect(2, 26, 13, 1, P.S); s.vl(14, 26, 3, P.t); s.rect(0, 29, 17, 3, P.t); s.rect(0, 29, 17, 1, P.s); s.hl(0, 31, 17, P.T);
    if (lit) s.light(8, 13, 40, col || '#FFD27A', { warm: 22, glow: 40, ga: 0.75 });
    return s.outlined();
  }
  // The Almanac post: a notice board with a little roof, a nailed page and a ribbon.
  function sign() {
    const s = new Spr(16, 20);
    s.poly([8, 0, 16, 4, 0, 4], (x, y) => y < 2 ? P.R : P.r); s.hl(0, 4, 16, P.Q);
    s.vl(2, 5, 15, P.w); s.vl(13, 5, 15, P.v); s.vl(3, 5, 15, P.v);
    s.rect(1, 5, 14, 9, P.W); s.rect(1, 5, 14, 1, P.v); s.hl(1, 13, 14, P.V);
    s.rect(3, 6, 6, 6, P.P); s.hl(4, 7, 4, P.t); s.hl(4, 9, 3, P.t); s.hl(4, 10, 4, P.t); s.set(3, 6, P.p); s.set(8, 11, P.p);
    s.rect(10, 7, 4, 4, P.C); s.hl(11, 8, 2, P.n); s.set(11, 6, P.e); s.set(12, 11, P.e); s.set(11, 11, P.e);
    s.rect(1, 18, 14, 2, P.t); s.hl(1, 18, 14, P.s);
    return s.outlined();
  }
  // Raid pin: the Ashen Wyrm coiled on an ash crag, embers in the rock.
  function wyrm() {
    const s = new Spr(26, 24);
    // crag
    s.poly([1, 23, 5, 17, 11, 16, 17, 17, 23, 18, 26, 23], (x, y) => y < 19 ? P.t : P.T);
    s.hl(6, 17, 10, P.s); s.set(9, 20, P.o); s.set(10, 21, P.e); s.set(17, 21, P.o); s.set(4, 21, P.e);
    // wings (back)
    s.poly([13, 10, 16, 1, 18, 5, 21, 0, 23, 6, 25, 3, 24, 12, 16, 13], P.j);
    s.line(16, 1, 15, 11, P.z); s.line(21, 0, 19, 11, P.z); s.line(25, 3, 23, 11, P.z);
    s.poly([16, 3, 17, 9, 15, 10], P.J); s.poly([21, 3, 20, 10, 18, 10], P.J);
    // body coil and tail
    s.blob(15, 14, 7, 4.5, [P.Z, P.M, P.z]); s.ell(15, 15.5, 4, 2, P.l); s.hl(12, 15, 6, '#B8805A');
    s.line(21, 16, 24, 15, P.M, 2); s.set(25, 13, P.z); s.set(25, 14, P.M);
    // neck and head (facing left)
    s.line(10, 12, 7, 6, P.M, 3); s.blob(6, 5, 4, 3, [P.Z, P.M, P.z]);
    s.rect(1, 5, 4, 2, P.M); s.hl(1, 7, 4, P.z); s.set(1, 6, P.o); s.set(2, 6, P.e); // jaw with fire
    s.set(5, 4, P.f); s.set(4, 4, P.F); // eye
    s.line(8, 2, 11, 0, P.P); s.line(7, 2, 8, 0, P.p); // horns
    s.light(4, 5, 12, '#FF6B3D', { warm: 8, glow: 14, ga: 0.8 });
    s.light(12, 20, 12, '#FF6B3D', { warm: 10, glow: 12, ga: 0.5 });
    return s.outlined();
  }
  // War horn (raid pin for the other great foes): 12 x 12
  function horn() {
    return S(['..........yY', '.........yya', '........yya.', '.....aaaya..', '...aaAyya...', '..aAyyya....', '.aAyyya.....', '.Ayyyy......', 'AYyyya......', 'Ayyya.......', '.AAa........', '............']).outlined();
  }
  // You: the hero's portrait in a gold ring with a tail pointing down at the lamp.
  function youFrame(portrait) {
    const s = new Spr(22, 26);
    s.ell(11, 11, 11, 11, P.y); s.ell(11, 11, 10, 10, P.Y); s.ell(11, 11, 9, 9, P.a); s.ell(11, 11, 8.3, 8.3, P.x);
    s.poly([7, 19, 15, 19, 11, 25], P.y); s.poly([9, 20, 13, 20, 11, 23], P.a);
    if (portrait) s.stamp(portrait, 3, 3);
    // re-cut the ring over the portrait corners
    for (let y = 0; y < 22; y++) for (let x = 0; x < 22; x++) { const d = Math.hypot(x + 0.5 - 11, y + 0.5 - 11); if (d > 8.3 && d <= 9) s.set(x, y, P.a); if (d > 9 && d <= 10) s.set(x, y, P.Y); if (d > 10 && d <= 11) s.set(x, y, P.y); }
    return s.outlined();
  }
  // An expedition team on the road: three walkers and a banner.
  function team() {
    const s = new Spr(20, 13);
    const walker = (x, body, hair) => { s.rect(x, 2, 3, 3, P.l); s.hl(x, 2, 3, hair); s.set(x + 2, 3, P.x); s.rect(x - 1, 5, 5, 4, body); s.hl(x - 1, 8, 5, P.V); s.set(x, 9, P.V); s.set(x + 2, 9, P.V); };
    walker(2, '#3E63C9', '#3A2A24'); walker(7, '#548A42', '#8A4A2A'); walker(12, '#8A5AC8', '#D8B070');
    s.vl(16, 0, 10, P.V); s.rect(17, 0, 3, 4, P.o); s.set(17, 4, P.o); s.set(19, 3, null);
    return s.outlined();
  }
  // Band flag: gold open, grey locked
  function flag(open) {
    const c1 = open ? P.y : P.s, c2 = open ? P.Y : P.S, c3 = open ? P.a : P.t;
    return S(['V.......', 'V' + 'x'.repeat(0) + 'aaaaa.', 'VyYyyya', 'VyYyya.', 'Vyyyya.', 'Vyy.ya.', 'Vy...a.', 'V......', 'V......', 'VV.....'].map(r => r.padEnd(8, '.')), { y: c1, Y: c2, a: c3 }).outlined();
  }
  // Locked region gate: a barred gate across the road, a padlock, the dark behind.
  function gate() {
    const s = new Spr(24, 18);
    s.rect(0, 2, 3, 16, P.t); s.rect(0, 2, 1, 16, P.s); s.rect(21, 2, 3, 16, P.t); s.rect(21, 2, 1, 16, P.s);
    s.rect(-1, 0, 5, 2, P.s); s.rect(20, 0, 5, 2, P.s);
    for (let x = 4; x < 21; x += 3) s.vl(x, 4, 13, P.i);
    s.hl(3, 5, 18, P.I); s.hl(3, 12, 18, P.I); s.hl(3, 13, 18, P.i);
    s.rect(9, 7, 6, 5, P.y); s.hl(9, 7, 6, P.Y); s.set(12, 9, P.x); s.set(12, 10, P.x);
    s.map(['.aa.', 'a..a', 'a..a'], P, 10, 4);
    return s.outlined();
  }

  // ================= terrain stamps =================
  function tree(r, v) {
    const s = new Spr(14, 16), tn = v ? [P.g, P.h, P.H] : [P.G, P.g, P.h];
    s.rect(6, 11, 2, 4, P.v); s.set(6, 11, P.w);
    s.blob(7, 6.5, 6.5, 6, tn); s.blob(5, 5, 3, 2.6, [tn[0], tn[0], tn[1]]);
    s.set(9, 9, tn[2]); s.set(4, 10, tn[2]);
    return s;
  }
  function pine() {
    const s = new Spr(11, 16);
    s.rect(5, 13, 1, 3, P.v);
    for (let k = 0; k < 3; k++) s.poly([5.5, 1 + k * 4, 10 - k * 0.5 + 0.5, 7 + k * 3, 1 + k * 0.5 - 0.5, 7 + k * 3], (x, y) => x < 5 ? P.g : P.h);
    s.vl(5, 2, 11, P.h);
    return s;
  }
  function rock() { const s = new Spr(8, 6); s.blob(4, 3.5, 4, 2.8, [P.S, P.s, P.t]); return s.outlined(); }
  function bush() { const s = new Spr(8, 6); s.blob(4, 3.3, 4, 2.8, [P.G, P.g, P.h]); s.set(2, 2, P.G); return s.outlined(); }
  function grave() { return S(['.ss.', 'sSst', 'sSst', 'sSst', 'tttT']).outlined(); }
  function shroom(c) { return S(['.RRr.', 'RPRrr', '.CCn.', '..Cn.'], { R: c || P.R, r: mix(c || P.R, '#301020', 0.35) }).outlined(); }
  function reed() { return S(['.w.w', '.g.g', 'g.gh', 'gghh', '.gh.']); }
  function mound() { const s = new Spr(16, 8); s.blob(8, 6, 8, 5, [P.g, P.h, P.H]); s.rect(6, 5, 4, 3, P.x); s.hl(6, 5, 4, P.t); s.vl(6, 5, 3, P.t); s.vl(9, 5, 3, P.t); return s.outlined(); }

  // ================= the plates =================
  const HOLLOW = {
    W: 180, H: 300,
    rows: [110, 150, 190, 230, 270],
    places: { rest: [84, 38], tavern: [32, 44], well: [150, 82], sign: [108, 84], lantern: [152, 40] }
  };
  function night(c) { return mix(desat(c, 0.55), '#0C1224', 0.62); }
  function nightHalf(c, d) { return mix(desat(c, 0.3), '#141C34', 0.35); }

  function paintHollow(save, o) {
    o = o || {};
    const W = 180, H = o.H || HOLLOW.H, r = rand(7);
    const pl = new Spr(W, H, P.g);
    // grass: tiled 12 x 12 texture with tufts (a JRPG tile), a few light patches
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const tx = x % 12, ty = y % 12, t = (Math.floor(x / 12) * 7 + Math.floor(y / 12) * 13) % 5;
      if ((tx === 3 && ty === 4) || (tx === 4 && ty === 3) || (tx === 9 && ty === 9) || (tx === 8 && ty === 10 && t > 1)) pl.set(x, y, P.G);
      else if ((tx === 4 && ty === 4) || (tx === 9 && ty === 10) || (tx === 7 && ty === 1 && t < 2)) pl.set(x, y, P.h);
    }
    // Lantern Hill: a plateau top right; its south face is a cliff (3/4 view), stairs cut into it
    const hillB = x => 50 + Math.round(Math.sin(x / 9) * 2 + Math.sin(x / 4.3)) - Math.max(0, Math.round((124 - x) * 0.9)) ;
    const hill = (x, y) => x >= 104 && y < hillB(x);
    for (let y = 0; y < 70; y++) for (let x = 100; x < W; x++) if (hill(x, y)) pl.set(x, y, (x * 3 + y * 5) % 23 === 0 ? P.G : (x + y * 2) % 29 === 0 ? P.h : '#5A8C48');
    for (let x = 100; x < W; x++) {
      const yb = hillB(x); if (yb <= 0 || x < 104) continue;
      pl.set(x, yb - 1, '#86B864');
      for (let k = 0; k < 9; k++) { const y = yb + k; pl.set(x, y, k === 0 ? P.S : k === 8 ? P.T : ((x * 7 + Math.floor(y / 3) * 5) % 11 === 0 || (y % 3 === 2 && (x + Math.floor(y / 3)) % 6 === 0)) ? P.T : x % 9 === 0 ? P.t : k < 3 ? P.s : P.t); }
    }
    // stairs up the cliff, from the camp side
    for (let k = 0; k < 9; k++) pl.rect(122, hillB(122) + 8 - k, 7, 1, k % 2 ? P.s : P.S);
    pl.vl(121, hillB(121) - 1, 11, P.T); pl.vl(129, hillB(129) - 1, 11, P.T);
    // the camp clearing: trodden earth
    pl.ell(84, 42, 32, 20, (x, y, dx, dy) => (dx * dx + dy * dy > 0.82) ? '#8A7048' : ((x * 7 + y * 3) % 17 === 0 ? '#8A7048' : '#A08458'));
    pl.ell(32, 48, 17, 9, (x, y, dx, dy) => (dx * dx + dy * dy > 0.75) ? '#8A7048' : '#A08458');
    // the marsh pond (bottom left) with a shore and lily pads
    const pond = (x, y) => ((x - 20) / 30) ** 2 + ((y - 252) / 24) ** 2 <= 1 && y > 236 && x < 48;
    for (let y = 225; y < 280; y++) for (let x = 0; x < 60; x++) if (pond(x, y)) { const edge = !pond(x, y - 1) || !pond(x + 1, y); pl.set(x, y, edge ? '#A0906A' : (y + x * 3) % 9 === 0 ? '#4A8AA0' : (y % 4 === 0 && x % 6 < 3) ? '#2E6A84' : '#24587A'); }
    for (const [x, y] of [[14, 246], [30, 258], [22, 262]]) pl.map(['.G.', 'GGg', '.g.'], P, x, y);
    // a stream from the hill to the pond, under the road (a bridge at each crossing)
    const streamX = y => Math.round(112 + Math.sin(y / 23) * 7 - (y - 60) * 0.1);
    for (let y = 30; y < 226; y++) { const x = streamX(y), hb = hillB(x); if (y < hb - 1) continue; if (y < hb + 9) { pl.rect(x - 1, y, 4, 1, (y + x) % 3 ? '#9AD8E8' : '#E0FCFF'); continue; } pl.rect(x - 1, y, 4, 1, '#2E6A84'); pl.set(x, y, '#4A8AA0'); pl.set(x - 2, y, '#8A7A5A'); pl.set(x + 3, y, P.h); }
    // road: from the camp gate down to row I, then a snake of 5 rows; 5 px wide, darker edges
    const rows = HOLLOW.rows, xl = 20, xr = 160;
    const snake = MAPDATA.snake(rows, xl, xr, 1, [[88, 56], [88, 90], [xl, 90]], [[xr, H + 2]]);
    const road = snake.pts;
    const roadSet = new Spr(W, H);
    for (let i = 0; i + 1 < road.length; i++) { const [x0, y0] = road[i], [x1, y1] = road[i + 1]; roadSet.line(x0, y0, x1, y1, 1, 6); }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (roadSet.get(x, y)) {
      const e = !roadSet.get(x, y - 1) || !roadSet.get(x - 1, y) || !roadSet.get(x + 1, y) || !roadSet.get(x, y + 1);
      pl.set(x, y, e ? '#6A5034' : ((x * 5 + y * 11) % 13 === 0 ? '#B89A6A' : '#A48558'));
    }
    // bridges where the road crosses the stream
    for (const y of [90, ...rows]) { const x = streamX(y); if (y > 58 && y < 226) { pl.rect(x - 3, y - 4, 8, 8, P.w); for (let k = 0; k < 8; k += 2) pl.hl(x - 3, y - 4 + k, 8, P.W); pl.vl(x - 4, y - 4, 8, P.V); pl.vl(x + 5, y - 4, 8, P.V); } }
    // decor: forests on the edges and between rows, rocks, graves, barrows, mushrooms, reeds
    const busy = (x, y, pad = 7) => { for (let yy = y - pad; yy <= y + pad; yy++) for (let xx = x - pad; xx <= x + pad; xx++) if (roadSet.get(xx, yy)) return true; return false; };
    const nearPlace = (x, y) => Object.values(HOLLOW.places).some(([px, py]) => Math.abs(px - x) < 20 && Math.abs(py - y) < 18);
    const trees = [];
    // forest belts: left and right edges, the bottom corners, and between rows
    for (let i = 0; i < 420; i++) {
      const x = Math.floor(r() * (W + 10)) - 5, y = Math.floor(r() * (H + 6)) - 4;
      const edge = x < 12 || x > W - 14 || (y < 22 && x < 60) || (y > 64 && y < 80 && (x < 40 || x > 128));
      const between = rows.some(ry => Math.abs(y - ry - 20) < 7) && r() < 0.5;
      if (!(edge || between)) continue;
      if (busy(x, y + 4, 8) || nearPlace(x, y) || hill(x, y + 10) || pond(x, y + 12) || Math.abs(streamX(y + 12) - x) < 6) continue;
      trees.push([x, y, r() < 0.2 ? 1 : 0]);
    }
    trees.sort((a, b) => a[1] - b[1]);
    const forest = new Spr(W, H);
    for (const [x, y, p] of trees) { const t = p ? pine() : tree(0, r() < 0.4); forest.stamp(t, x - 7, y - 8); }
    const fo = forest.outlined();
    pl.stamp(fo, -1, -1);
    // stamps (3/4 objects with their own outline)
    const put = (s, x, y) => pl.stamp(s, x - Math.floor(s.w / 2), y - s.h + 1);
    for (const [x, y] of [[60, 140], [96, 176], [140, 214], [74, 256], [150, 130], [40, 212], [128, 170]]) if (!busy(x, y, 4)) put(rock(), x, y);
    for (const [x, y] of [[134, 123], [142, 125], [138, 131], [148, 124]]) put(grave(), x, y);
    put(mound(), 70, 213); put(mound(), 92, 216);
    for (const [x, y, c] of [[40, 168], [46, 172], [36, 174]]) put(shroom(c ? '#B858A0' : '#C8508A'), x, y);
    for (const [x, y] of [[44, 244], [48, 262], [6, 272], [52, 252]]) pl.stamp(reed().outlined(), x, y);
    for (const [x, y] of [[120, 96], [50, 130], [160, 176], [24, 196], [110, 256]]) if (!busy(x, y, 4)) put(bush(), x, y);
    // quarry (bottom right): cut stone steps
    for (let k = 0; k < 4; k++) pl.rect(150 + k * 4, 240 + k * 3, 30 - k * 4, 3, k % 2 ? P.s : P.S);
    pl.hl(150, 252, 30, P.T);
    // ---- lamps: one per zone above the road; lit when the zone's boss is beaten ----
    const lamps = snake.lamps.map((l, i) => ({ ...l, zone: i + 1 }));
    const lights = [];
    for (const l of lamps) {
      const lit = l.zone < save.maxZone, s = lamp(lit);
      pl.stamp(s, l.x - 3, l.y - 14);
      l.lit = lit;
      if (lit) lights.push({ x: l.x, y: l.y - 4, r: 25, warm: 14, wy: 0.6, col: '#FFBA60' });
    }
    // the camp is always lit (the Hearth); the hill glows gold when the Great Lantern is lit
    lights.push({ x: 84, y: 42, rx: 62, ry: 44, warm: 24, col: '#FF9A48' });
    lights.push({ x: 32, y: 46, r: 30, warm: 0 }, { x: 150, y: 76, r: 24, warm: 12, col: '#6FD0E8' }, { x: 108, y: 80, r: 20, warm: 0 });
    const allLit = !!(save.lit && save.lit.hollow);
    if (allLit) lights.push({ x: 152, y: 30, r: 70, warm: 40, col: '#FFD27A' });
    const out = relight(pl, lights, { dark: night, half: nightHalf, edge: 6, allLit, dither: 1 });
    const pins = [
      { id: 'rest', at: HOLLOW.places.rest, spr: rest(), label: "Hollow's Rest", dot: 0 },
      { id: 'tavern', at: HOLLOW.places.tavern, spr: tavern(), label: 'Tavern', dot: save.dots.tavern },
      { id: 'well', at: HOLLOW.places.well, spr: well(), label: 'Deepwell' },
      { id: 'sign', at: HOLLOW.places.sign, spr: sign(), label: 'Almanac', dot: save.dots.sign },
      { id: 'lantern', at: HOLLOW.places.lantern, spr: greatLantern(allLit, '#F2C14E'), label: 'Great Lantern' }
    ];
    return { plate: out, lamps, pins, rows, W, H, flags: rows.map((y, i) => ({ band: i, y, open: save.maxZone > i * 7 })), glowLights: pl.lights };
  }
  // Coast and the locked region (for the whole-map scroll)
  function paintCoast(save) {
    const W = 180, H = 236, r = rand(11), pl = new Spr(W, H, '#5E8A5A');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const tx = x % 12, ty = y % 12; if ((tx === 3 && ty === 4) || (tx === 9 && ty === 9)) pl.set(x, y, '#7AA46A'); else if (tx === 4 && ty === 4) pl.set(x, y, '#46704A'); }
    // the sea (left), a shingle beach, waves
    const shore = y => 40 + Math.round(Math.sin(y / 17) * 6 + Math.sin(y / 7) * 2);
    for (let y = 0; y < H; y++) { const s = shore(y); for (let x = 0; x < s + 8; x++) pl.set(x, y, x < s ? ((x * 3 + y * 7) % 23 === 0 || (y % 6 === 0 && (x + y) % 12 < 3) ? '#4A8AA0' : x > s - 3 ? '#2E6A84' : '#1E4E6A') : ((x + y) % 3 ? '#B0A488' : '#948870')); }
    // cliffs and rocks on the beach
    const rows = [40, 80, 120, 160, 200], xl = 62, xr = 162;
    const sn = MAPDATA.snake(rows, xl, xr, 0, [[160, -2], [160, 40]], [[xl, H + 2]]);
    const roadSet = new Spr(W, H);
    for (let i = 0; i + 1 < sn.pts.length; i++) { const [x0, y0] = sn.pts[i], [x1, y1] = sn.pts[i + 1]; roadSet.line(x0, y0, x1, y1, 1, 6); }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (roadSet.get(x, y)) { const e = !roadSet.get(x, y - 1) || !roadSet.get(x - 1, y) || !roadSet.get(x + 1, y) || !roadSet.get(x, y + 1); pl.set(x, y, e ? '#6A5E48' : '#A89878'); }
    const busy = (x, y, pad = 7) => { for (let yy = y - pad; yy <= y + pad; yy++) for (let xx = x - pad; xx <= x + pad; xx++) if (roadSet.get(xx, yy)) return true; return false; };
    const forest = new Spr(W, H), tr = [];
    for (let i = 0; i < 260; i++) { const x = Math.floor(r() * W), y = Math.floor(r() * H); if (x < shore(y) + 12 || busy(x, y + 4, 8)) continue; if (!(x > W - 12 || rows.some(ry => Math.abs(y - ry - 20) < 6))) continue; tr.push([x, y]); }
    tr.sort((a, b) => a[1] - b[1]); for (const [x, y] of tr) forest.stamp(pine(), x - 5, y - 8);
    pl.stamp(forest.outlined(), -1, -1);
    // the lighthouse on a rock in the sea (the Coast's Great Lantern)
    pl.blob(20, 214, 12, 6, [P.s, P.t, P.T]);
    const lamps = sn.lamps.map((l, i) => ({ ...l, zone: 36 + i }));
    const lights = [];
    for (const l of lamps) { const lit = l.zone < save.maxZone; pl.stamp(lamp(lit), l.x - 3, l.y - 14); l.lit = lit; if (lit) lights.push({ x: l.x, y: l.y - 6, r: 26, warm: 9, col: '#FFBA60' }); }
    const out = relight(pl, lights, { dark: night, half: nightHalf, edge: 6, dither: 1 });
    const pins = [{ id: 'lantern', at: [20, 206], spr: greatLantern(false), label: 'Great Lantern' }];
    return { plate: out, lamps, pins, rows, W, H, flags: rows.map((y, i) => ({ band: 5 + i, y, open: save.maxZone > 35 + i * 7 })), glowLights: pl.lights };
  }
  function paintBeyond(save) {
    const W = 180, H = 84, r = rand(5), pl = new Spr(W, H, '#4A4048');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const n = r(); if (n < 0.06) pl.set(x, y, '#5E5460'); else if (n < 0.08) pl.set(x, y, '#8A3A30'); }
    for (let i = 0; i < 6; i++) { const x = 20 + i * 28 + Math.floor(r() * 10), y = 14 + Math.floor(r() * 50); pl.line(x, y, x + 6, y + 3, '#B8442E'); }
    pl.line(62, 0, 62, 30, '#6A5E58', 5); pl.line(62, 30, 40, 44, '#6A5E58', 5);
    for (let k = 0; k < 6; k++) pl.set(40 - k * 3, 44 + k, '#6A5E58');
    const out = relight(pl, [], { dark: c => mix(desat(c, 0.6), '#0A0A14', 0.72) });
    return { plate: out, lamps: [], pins: [{ id: 'raid', at: [132, 50], spr: wyrm(), label: 'Raid: the Ashen Wyrm', dot: 1, lit: 1 }, { id: 'gate', at: [62, 30], spr: gate(), label: 'Reach zone 71', dim: 1 }], rows: [], W, H, flags: [] };
  }

  // ================= five regions: one slice each, and the locked (dim) version =================
  const RP = [
    { g: '#4C7E40', G: '#6E9E52', h: '#35613A', road: '#A48558', edge: '#6A5034' },
    { g: '#5E8A5A', G: '#7AA46A', h: '#46704A', road: '#A89878', edge: '#6A5E48', sea: 1 },
    { g: '#5A5058', G: '#6E646A', h: '#443C44', road: '#7A6A60', edge: '#4A3E3A', ember: 1 },
    { g: '#C8D0E0', G: '#E8EEF8', h: '#A0A8C0', road: '#8A8078', edge: '#5A5250' },
    { g: '#3A3450', G: '#4A4462', h: '#2A2640', road: '#6E6886', edge: '#2A2640' }
  ];
  const dim = c => mix(desat(c, 0.8), '#1E1A20', 0.62);
  function regionTile(i, locked) {
    const R = RP[i], W = 60, H = 40, s = new Spr(W, H, R.g);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const tx = x % 12, ty = y % 12; if ((tx === 3 && ty === 4) || (tx === 9 && ty === 9)) s.set(x, y, R.G); else if (tx === 4 && ty === 4) s.set(x, y, R.h); }
    if (R.sea) for (let y = 0; y < H; y++) { const e = 9 + Math.round(Math.sin(y / 5) * 2); for (let x = 0; x < e + 3; x++) s.set(x, y, x < e ? ((x + y * 3) % 7 === 0 ? '#4A8AA0' : '#24587A') : '#A89C80'); }
    if (R.ember) for (const [x, y] of [[8, 8], [40, 14], [24, 20], [52, 6]]) { s.line(x, y, x + 5, y + 2, '#B8442E'); s.set(x + 2, y + 1, '#FF9E3D'); }
    const put = (sp, x, y) => s.stamp(sp, x - Math.floor(sp.w / 2), y - sp.h + 1);
    if (i === 0) { put(tree(0, 0).outlined(), 10, 22); put(tree(0, 1).outlined(), 52, 20); put(tree(0, 0).outlined(), 32, 14); }
    if (i === 1) { put(pine().outlined(), 30, 18); put(pine().outlined(), 52, 20); }
    if (i === 2) { for (const x of [14, 46]) { const d = new Spr(10, 14); d.vl(4, 3, 11, '#3A3034'); d.line(4, 6, 1, 2, '#3A3034'); d.line(5, 5, 8, 1, '#3A3034'); d.line(4, 9, 7, 7, '#3A3034'); put(d.outlined(), x, 22); } put(rock(), 30, 18); }
    if (i === 3) { for (const x of [10, 32, 52]) { const sp = pine().recolor(c => c === P.g ? '#5A7A8A' : c === P.h ? '#3A5468' : c); for (let y = 0; y < sp.h; y += 4) for (let xx = 0; xx < sp.w; xx++) if (sp.get(xx, y) && sp.get(xx, y) !== P.v) sp.set(xx, y, '#F2F6FF'); put(sp.outlined(), x, 22); } }
    if (i === 4) { for (const [x, h] of [[10, 12], [30, 8], [50, 14]]) { const c = new Spr(8, h); c.poly([4, 0, 8, h, 0, h], (xx) => xx < 4 ? '#8A7AB0' : '#5A4A80'); c.vl(4, 2, h - 3, '#D8C8FF'); c.light(4, 3, 10, '#B58CFF', { glow: 10, ga: 0.5 }); put(c.outlined(), x, 22); } }
    const band = new Spr(W, H); band.line(0, 31, W, 31, 1, 6);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (band.get(x, y)) s.set(x, y, (!band.get(x, y - 1) || !band.get(x, y + 1)) ? R.edge : R.road);
    const l1 = lamp(!locked), l2 = lamp(false); s.stamp(l1, 18 - 3, 28 - 14 + 1); s.stamp(l2, 42 - 3, 28 - 14 + 1);
    if (locked) { const out = s.recolor(dim); return { plate: out, glow: [], pins: [{ at: [30, 36], spr: gate() }] }; }
    const out = relight(s, [{ x: 18, y: 24, r: 22, warm: 12, wy: 0.6, col: '#FFBA60' }], { dark: night, half: nightHalf, edge: 5, dither: 1 });
    return { plate: out, glow: s.lights };
  }

  const sheet = portrait => [
    { name: "Hollow's Rest", note: 'tents, the fire, a lantern pole', spr: rest() },
    { name: 'The Tavern', note: 'red roof, lit windows, mug sign', spr: tavern() },
    { name: 'The Deepwell', note: 'stone mouth, winch, blue glow', spr: well() },
    { name: 'Great Lantern (lit)', note: 'gold light over the hill', spr: greatLantern(true, '#F2C14E') },
    { name: 'Great Lantern (dark)', note: 'cold glass', spr: greatLantern(false) },
    { name: 'Raid: the Ashen Wyrm', note: 'coiled on an ash crag', spr: wyrm() },
    { name: 'War horn', note: 'raid pin, other foes', spr: horn() },
    { name: 'Almanac post', note: 'notice board at the gate', spr: sign() },
    { name: 'Road lamp, lit', note: 'zone boss beaten', spr: lamp(true) },
    { name: 'Road lamp, dark', note: 'not yet', spr: lamp(false) },
    { name: 'You', note: 'portrait in a gold ring', spr: youFrame(portrait) },
    { name: 'Team out', note: 'three walkers and a banner', spr: team() },
    { name: 'Band flag', note: 'open / locked', spr: flag(true), spr2: flag(false) },
    { name: 'Locked region', note: 'barred gate, padlock', spr: gate() }
  ];
  const swatch = (w, h, lit) => {
    const s = new Spr(w, h, P.g);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const tx = x % 12, ty = y % 12; if ((tx === 3 && ty === 4) || (tx === 9 && ty === 9)) s.set(x, y, P.G); else if (tx === 4 && ty === 4) s.set(x, y, P.h); }
    return lit === false ? s.recolor(night) : s;
  };
  return {
    key: 'A', name: 'Dusk overworld', pitch: 'A 16-bit JRPG world map: tiles, forests, a cliff, a pond. The land past your last lamp waits in the night palette.',
    paintHollow, paintCoast, paintBeyond, sheet, swatch, youFrame, team, flag, P, night, regionTile
  };
})();
