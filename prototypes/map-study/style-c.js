// map-study/style-c.js: candidate C, "Lamplit terraces". The region at night, seen from the side
// like the fight stage: the Lantern Road zigzags down a hillside in 5 stone terraces (one per band
// of 7 zones), with a tall lamp post per zone and a small picture of that zone beside it (moss,
// a cave mouth, graves, a barrow, giant caps, cut stone, reeds). Lit lamps light their stretch of
// terrace in warm bands; the rest of the hill is a cold blue silhouette.
'use strict';
const STYLE_C = (() => {
  const { INK, mix, desat, rand, Spr, fromMap, relight } = MK;
  const P = {
    k: INK,
    W: '#A87444', w: '#7A4E30', v: '#523222', V: '#34200F',
    R: '#C8563E', r: '#94362E', q: '#62222A',
    C: '#E8DCB8', c: '#C4AE84', n: '#8E7654', N: '#5E4C36',
    S: '#9A94AC', s: '#6E6886', t: '#4A4562', T: '#2E2A40',
    F: '#FFF3C4', f: '#FFD27A', o: '#FF9E3D', e: '#E0524F',
    d: '#4A5064', D: '#30344A',
    I: '#6A6480', i: '#34304A',
    G: '#5E9A5A', g: '#3E7448', h: '#2A5440', H: '#1A3A34',
    B: '#E0FCFF', b: '#7FE0EC', u: '#2F7A98', U: '#173A58',
    Y: '#FFE08A', y: '#E4B44A', a: '#A8762A', A: '#6A4418',
    P: '#EFE6D6', p: '#C8BCA4', x: '#150F1E', m: '#3E3040',
    M: '#8A3345', z: '#4A1A2A', Z: '#C85A5E', l: '#D8A070', j: '#5A2230', J: '#A0444E',
    O: '#B070C0', Q: '#FF9ED8'
  };
  const S = (rows, o) => fromMap(rows, Object.assign({}, P, o));
  const FL = '#FFBA60';

  // ================= landmarks (side view, lit windows, glows) =================
  function rest() {
    const s = new Spr(50, 30);
    // two poles with a rope of little lanterns over the fire
    s.vl(6, 2, 24, P.v); s.vl(7, 2, 24, P.w); s.vl(43, 2, 24, P.v); s.vl(44, 2, 24, P.w);
    for (let x = 8; x < 43; x++) { const y = 3 + Math.round(Math.sin((x - 8) / 35 * Math.PI) * 6); s.set(x, y, P.N); }
    for (let k = 0; k < 5; k++) { const x = 12 + k * 7, y = 4 + Math.round(Math.sin((x - 8) / 35 * Math.PI) * 6); s.map(['i', 'f', 'o'], P, x, y); s.light(x, y + 1, 8, FL, { warm: 5, glow: 9, ga: 0.5 }); }
    // tents
    const tent = (x, c1, c2, c3) => { s.poly([x + 8, 11, x + 16, 25, x, 25], (px) => px < x + 8 ? c1 : c2); s.vl(x + 8, 11, 14, P.V); s.poly([x + 8, 17, x + 11, 25, x + 5, 25], P.x); s.set(x + 8, 10, P.V); s.rect(x + 9, 9, 3, 2, P.e); };
    tent(1, P.C, P.c, P.n); tent(33, P.R, P.r, P.q);
    // the fire, logs to sit on, a pot on a tripod
    s.map(['.....F.....', '....fo..f..', '...ofFo.o..', '..ooFFfoo..', '..eoFFFfoe.', '.eeofFFfoe.', '.SwwWwwWwvS', 'SstSvvvvtSt'], P, 19, 18);
    s.map(['WWWw', 'vvvv'], P, 15, 24); s.map(['WWWw', 'vvvv'], P, 31, 24);
    s.light(24, 21, 30, '#FF9A48', { warm: 22, glow: 34, ga: 0.8 });
    s.hl(0, 26, 50, P.N);
    return s.outlined();
  }
  function tavern() {
    const s = new Spr(32, 32);
    s.rect(23, 2, 4, 8, P.t); s.vl(23, 2, 8, P.s); s.hl(22, 2, 6, P.T); s.set(24, 0, P.p); s.set(25, -1, P.p);
    // roof (side view: a long slope) and gable
    s.poly([2, 12, 12, 4, 30, 4, 30, 12], (x, y) => y < 7 ? P.R : P.r); for (let x = 12; x < 30; x += 3) s.vl(x, 5, 7, P.q); s.hl(1, 12, 30, P.q);
    // walls: timber, two storeys of lit windows
    s.rect(3, 13, 26, 16, P.w); s.vl(3, 13, 16, P.W); s.vl(28, 13, 16, P.v); s.hl(3, 20, 26, P.v);
    for (const x of [6, 13, 22]) { s.rect(x, 15, 4, 3, P.f); s.set(x, 15, P.F); s.set(x + 1, 15, P.F); s.hl(x - 1, 18, 6, P.V); s.light(x + 2, 16, 9, FL, { warm: 7, glow: 10 }); }
    s.rect(6, 22, 4, 3, P.f); s.set(6, 22, P.F); s.rect(22, 22, 4, 3, P.f); s.light(8, 23, 9, FL, { warm: 7, glow: 10 }); s.light(24, 23, 9, FL, { warm: 7, glow: 10 });
    s.rect(13, 21, 5, 8, P.x); s.rect(14, 22, 3, 7, '#6A3A1E'); s.set(16, 25, P.y); s.light(15, 26, 10, FL, { warm: 8, glow: 10 });
    s.hl(1, 29, 30, P.V);
    // hanging lantern and mug sign
    s.hl(28, 14, 4, P.V); s.vl(31, 14, 2, P.V); s.rect(29, 16, 4, 5, P.V); s.map(['yy.', 'Yya', 'yya'], P, 29, 17);
    s.map(['i', 'f', 'o'], P, 2, 21); s.light(2, 22, 10, FL, { warm: 8, glow: 12 });
    return s.outlined();
  }
  function well() {
    const s = new Spr(26, 32);
    // a beam of blue light from the shaft
    for (let y = 0; y < 18; y++) { const w = 3 + Math.floor(y / 5); for (let x = 13 - w; x <= 12 + w; x++) if ((x + y) % 2 === 0 || Math.abs(x - 12.5) < w - 1) s.set(x, y, y < 6 ? null : (Math.abs(x - 12.5) < 1.5 ? P.B : P.b)); }
    // A-frame roof on two posts
    s.poly([13, 8, 25, 15, 1, 15], (x, y) => x < 13 ? P.R : P.r); s.hl(0, 15, 26, P.q); s.poly([13, 11, 20, 15, 6, 15], null);
    for (let x = 6; x < 20; x++) for (let y = 11; y < 15; y++) if (s.get(x, y) == null && y > 8 + Math.abs(x - 13) * 0.55 + 2) s.set(x, y, (Math.abs(x - 12.5) < 2) ? P.B : P.b);
    s.vl(4, 16, 9, P.w); s.vl(5, 16, 9, P.v); s.vl(20, 16, 9, P.w); s.vl(21, 16, 9, P.v);
    s.hl(4, 18, 18, P.W); s.hl(4, 19, 18, P.v); s.rect(21, 17, 3, 3, P.I); s.set(24, 18, P.i);
    s.vl(12, 20, 3, P.p); s.rect(11, 22, 3, 2, P.w);
    // stone ring (side view)
    s.rect(2, 24, 22, 7, P.s); s.hl(2, 24, 22, P.S); s.hl(3, 23, 20, P.U);
    for (let x = 2; x < 24; x += 4) s.vl(x + (Math.floor(x / 4) % 2), 25, 6, P.t); s.hl(2, 27, 22, P.t); s.hl(2, 30, 22, P.T);
    s.light(12, 12, 22, '#6FD0E8', { warm: 12, wy: 1, glow: 30, ga: 0.75 });
    return s.outlined();
  }
  function greatLantern(lit, col) {
    const s = new Spr(22, 46), g1 = lit ? P.F : P.d, g2 = lit ? P.f : P.D, g3 = lit ? P.o : P.D;
    s.map(['...yy...', '..y..y..', '...yy...'], P, 7, 0);
    s.poly([11, 3, 19, 9, 3, 9], (x, y) => y < 6 ? P.Y : P.y); s.hl(2, 9, 19, P.a);
    s.rect(4, 10, 15, 13, g2); s.rect(6, 11, 7, 11, g1); s.rect(14, 11, 4, 11, g3); if (lit) s.rect(8, 13, 3, 6, '#FFFFFF');
    for (const x of [4, 11, 18]) s.vl(x, 10, 13, x === 18 ? P.a : P.y); s.hl(4, 16, 15, lit ? P.y : P.a);
    s.hl(2, 23, 19, P.a); s.hl(3, 22, 17, P.y);
    // tall stone column with bands
    s.rect(7, 24, 9, 16, P.s); s.vl(7, 24, 16, P.S); s.vl(8, 24, 16, P.S); s.vl(15, 24, 16, P.t); s.hl(6, 28, 11, P.T); s.hl(6, 29, 11, P.y); s.hl(6, 36, 11, P.T);
    s.rect(3, 40, 17, 3, P.s); s.hl(3, 40, 17, P.S); s.vl(19, 40, 3, P.t); s.rect(1, 43, 21, 3, P.t); s.hl(1, 43, 21, P.s);
    if (lit) s.light(11, 16, 60, col || '#FFD27A', { warm: 30, glow: 64, ga: 0.9 });
    return s.outlined();
  }
  function sign() {
    const s = new Spr(18, 26);
    s.vl(3, 2, 24, P.w); s.vl(4, 2, 24, P.v); s.vl(14, 2, 24, P.w); s.vl(15, 2, 24, P.v);
    s.poly([9, 0, 18, 4, 0, 4], P.r); s.hl(0, 4, 18, P.q);
    s.rect(2, 6, 14, 10, P.W); s.hl(2, 6, 14, P.v); s.hl(2, 15, 14, P.V);
    s.rect(4, 7, 5, 7, P.P); s.hl(5, 9, 3, P.t); s.hl(5, 11, 3, P.t); s.rect(10, 8, 4, 5, P.C); s.set(11, 7, P.e);
    s.hl(4, 5, 10, P.N); s.map(['i', 'f', 'o'], P, 9, 16); s.light(9, 17, 10, FL, { warm: 8, glow: 12 });
    return s.outlined();
  }
  function lamp(lit) {
    const s = lit
      ? S(['.iiiiii', '..I...i', '.....iii', '....iFfoi', '....ifFfi', '....iffoi', '....ioooi', '.....iii', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '.iIi', 'tssst'].map(r => r.padEnd(9, '.')))
      : S(['.iiiiii', '..I...i', '.....iii', '....iddDi', '....idDDi', '....iDDDi', '....iDDDi', '.....iii', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '..i', '.iIi', 'tssst'].map(r => r.padEnd(9, '.')));
    for (let y = 0; y < 19; y++) if (s.get(2, y)) s.set(1, y, lit ? P.I : P.t);
    if (lit) s.light(6, 5, 12, FL, { warm: 12, glow: 16, ga: 0.8 });
    return s.outlined();
  }
  function wyrm() {
    const s = new Spr(32, 28);
    // crag
    s.poly([0, 27, 4, 19, 10, 17, 16, 18, 22, 16, 28, 19, 32, 27], (x, y) => y < 21 ? P.t : P.T); s.hl(6, 18, 12, P.s);
    for (const [x, y] of [[8, 23], [14, 21], [22, 24], [26, 22]]) { s.set(x, y, P.o); s.set(x + 1, y, P.e); }
    // wings raised
    s.poly([14, 12, 17, 0, 20, 5, 24, 1, 26, 7, 30, 4, 28, 14, 18, 15], P.j);
    for (const [a, b] of [[17, 0], [24, 1], [30, 4]]) s.line(a, b, a - 3, 13, P.z);
    s.poly([17, 3, 18, 11, 15, 12], P.J); s.poly([24, 4, 23, 12, 20, 12], P.J);
    // body, tail, neck and head
    s.blob(17, 15, 7, 4, [P.Z, P.M, P.z]); s.ell(16, 16.5, 4.5, 1.8, P.l);
    s.line(23, 16, 29, 17, P.M, 2); s.set(30, 16, P.z);
    s.line(11, 13, 7, 7, P.M, 3); s.blob(6, 6, 4.5, 3.2, [P.Z, P.M, P.z]); s.rect(0, 6, 4, 2, P.M); s.hl(0, 8, 4, P.z);
    s.set(0, 9, P.f); s.set(1, 9, P.o); s.set(0, 10, P.o); s.set(5, 5, P.F); s.set(6, 5, P.f);
    s.line(8, 3, 11, 0, P.P); s.line(7, 3, 8, 0, P.p);
    s.light(2, 8, 16, '#FF6B3D', { warm: 10, glow: 20, ga: 0.9 }); s.light(16, 24, 18, '#FF4A2A', { warm: 12, glow: 24, ga: 0.6 });
    return s.outlined();
  }
  function horn() { return S(['..........yY', '.........yya', '........yya.', '.....aaaya..', '...aaAyya...', '..aAyyya....', '.aAyyya.....', '.Ayyyy......', 'AYyyya......', 'Ayyya.......', '.AAa........']).outlined(); }
  // You: your portrait as the glass of a lantern (cap, ring, cage, base)
  function youFrame(portrait) {
    const s = new Spr(22, 30);
    s.map(['........yy........', '.......y..y.......', '........yy........'], P, 2, 0);
    s.poly([11, 3, 20, 7, 2, 7], (x, y) => y < 5 ? P.Y : P.y); s.hl(1, 7, 20, P.a);
    s.rect(1, 8, 20, 20, P.y); s.rect(2, 9, 18, 18, P.a); s.rect(3, 10, 16, 16, P.x);
    if (portrait) s.stamp(portrait, 3, 10);
    s.vl(1, 8, 20, P.Y); s.hl(1, 8, 20, P.Y);
    s.hl(1, 27, 20, P.a); s.poly([5, 28, 17, 28, 11, 30], P.y);
    s.light(11, 18, 16, '#FFD27A', { glow: 20, ga: 0.55 });
    return s.outlined();
  }
  // a team out: three walkers, the front one carrying a lantern on a pole
  function team() {
    const s = new Spr(22, 16);
    const walker = (x, body, hood) => { s.rect(x, 4, 4, 4, P.l); s.rect(x, 3, 4, 2, hood); s.set(x, 5, hood); s.set(x + 3, 5, P.x); s.rect(x - 1, 8, 6, 5, body); s.hl(x - 1, 12, 6, P.V); s.vl(x, 13, 2, P.V); s.vl(x + 3, 13, 2, P.V); };
    walker(2, '#6A4AA0', '#3A2A24'); walker(8, '#3E7448', '#8A4A2A'); walker(14, '#2F57B0', '#D8B070');
    s.line(17, 9, 21, 2, P.v); s.map(['i', 'f', 'o'], P, 21, 3); s.light(21, 4, 10, FL, { warm: 6, glow: 12 });
    return s.outlined();
  }
  function flag(open) {
    const c1 = open ? P.y : P.s, c2 = open ? P.Y : P.S, c3 = open ? P.a : P.t;
    return S(['V......', 'Vyyyyy.', 'VYyyya.', 'Vyyya..', 'Vyyyya.', 'Vy..ya.', 'V......', 'V......', 'VV.....'], { y: c1, Y: c2, a: c3 }).outlined();
  }
  function gate() {
    const s = new Spr(28, 26);
    s.rect(1, 4, 4, 22, P.t); s.vl(1, 4, 22, P.s); s.rect(23, 4, 4, 22, P.t); s.vl(23, 4, 22, P.s);
    s.rect(0, 2, 6, 2, P.s); s.rect(22, 2, 6, 2, P.s);
    for (let x = 6; x < 23; x += 3) s.vl(x, 6, 20, P.i); s.hl(5, 8, 18, P.I); s.hl(5, 18, 18, P.I);
    s.line(6, 10, 22, 16, P.I); s.line(6, 16, 22, 10, P.I); s.rect(12, 11, 4, 5, P.a); s.hl(12, 11, 4, P.y);
    // a dark lantern on the left post
    s.map(['.i.', 'iDi', 'iDi', '.i.'], P, 2, -1);
    return s.outlined();
  }

  // ================= zone vignettes (one per lamp, the zone type of that lamp) =================
  // 0 Mossy Hollow, 1 Batwing Caves, 2 Bonefield, 3 Beetle Barrows, 4 Fungal Deep, 5 Quarry Ruins, 6 Wraithmarsh
  function vignette(t, r) {
    const s = new Spr(16, 16);
    if (t === 0) { s.blob(8, 11, 7, 5, [P.G, P.g, P.h]); s.blob(4, 12, 3, 3, [P.G, P.g, P.h]); s.set(6, 8, '#D8F07A'); s.set(12, 6, '#D8F07A'); s.set(3, 5, '#D8F07A'); }
    else if (t === 1) { s.poly([0, 16, 3, 5, 8, 1, 13, 4, 16, 16], (x, y) => x < 6 ? P.s : P.t); s.poly([5, 16, 8, 8, 11, 16], P.x); s.set(8, 11, '#7FB2FF'); s.set(6, 3, P.x); s.set(10, 4, P.x); }
    else if (t === 2) { for (const [x, h] of [[2, 7], [8, 9], [13, 6]]) { s.rect(x, 16 - h, 3, h, P.S); s.vl(x + 2, 16 - h, h, P.s); s.hl(x - 1, 13 - h + 4, 5, P.s); } s.map(['.P', 'PP'], P, 6, 14); }
    else if (t === 3) { s.blob(8, 14, 8, 7, [P.g, P.h, P.H]); s.rect(6, 10, 5, 6, P.x); s.hl(5, 9, 7, P.s); s.vl(5, 10, 6, P.s); s.vl(11, 10, 6, P.s); s.set(8, 12, '#9BE3F0'); }
    else if (t === 4) { s.vl(5, 6, 10, P.C); s.vl(6, 6, 10, P.c); s.ell(6, 5, 6, 3.5, P.O); s.ell(5, 4, 3, 1.6, '#D090D8'); s.set(3, 5, P.Q); s.set(8, 4, P.Q); s.vl(12, 11, 5, P.C); s.ell(12.5, 11, 3, 2, '#C8508A'); }
    else if (t === 5) { s.rect(1, 9, 7, 7, P.S); s.rect(1, 9, 7, 1, '#C8C0D0'); s.vl(7, 9, 7, P.t); s.rect(8, 12, 6, 4, P.s); s.hl(8, 12, 6, P.S); s.vl(13, 3, 13, P.w); s.hl(10, 3, 6, P.w); s.vl(10, 3, 3, P.v); }
    else { for (let k = 0; k < 6; k++) { const x = 1 + k * 2 + (k > 2 ? 3 : 0), h = 5 + (k * 7) % 5; s.vl(x, 16 - h, h, k % 2 ? P.g : P.G); s.set(x, 15 - h, P.w); } s.hl(0, 15, 16, '#2E6A84'); s.hl(3, 14, 8, '#4A8AA0'); s.set(11, 7, '#9FE8C8'); }
    return s.outlined();
  }

  // ================= plates =================
  const night = c => mix(desat(c, 0.5), '#080C1A', 0.62);
  const halfN = c => mix(desat(c, 0.25), '#101830', 0.4);
  function sky(pl, y0, y1, cols, r, stars) {
    for (let y = y0; y < y1; y++) { const t = (y - y0) / (y1 - y0), i = Math.min(cols.length - 1, Math.floor(t * cols.length)); for (let x = 0; x < pl.w; x++) { const dith = t * cols.length - i > 0.85 && (x + y) % 2 ? Math.min(cols.length - 1, i + 1) : i; pl.set(x, y, cols[dith]); } }
    if (stars) for (let i = 0; i < stars; i++) { const x = Math.floor(r() * pl.w), y = y0 + Math.floor(r() * (y1 - y0) * 0.8); pl.set(x, y, r() < 0.3 ? '#FFF3C4' : '#8A94C0'); }
  }
  // one terrace: backdrop above the ground line (pines, far ridge), a lip, the road, a stone wall
  function terrace(pl, gy, top, r, pal) {
    // far ridge and pines in the backdrop
    const ridge = x => top + 6 + Math.round(Math.sin(x / 13 + gy) * 3 + Math.sin(x / 5 + gy * 0.3) * 1.5);
    for (let x = 0; x < pl.w; x++) for (let y = ridge(x); y < gy; y++) pl.set(x, y, pal.far);
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(r() * pl.w), h = 8 + Math.floor(r() * 12), base = gy - 1;
      for (let k = 0; k < h; k++) { const w = Math.max(0, Math.round((k / h) * 3.2)); pl.rect(x - w, base - h + k, w * 2 + 1, 1, k === 0 || (k % 4 === 0) ? pal.pine2 : pal.pine); }
    }
    for (let x = 0; x < pl.w; x++) { pl.set(x, gy - 1, pal.lip2); }
    // lip, road, wall
    for (let x = 0; x < pl.w; x++) {
      pl.set(x, gy, pal.lip); pl.set(x, gy + 1, pal.road); pl.set(x, gy + 2, (x * 7) % 11 === 0 ? pal.road2 : pal.road); pl.set(x, gy + 3, pal.road2);
      for (let k = 4; k < 12; k++) { const y = gy + k, row = Math.floor((k - 4) / 3), bx = (x + row * 3) % 7; pl.set(x, y, k === 4 ? pal.wallHi : (bx === 0 || (k - 4) % 3 === 2) ? pal.wallD : k > 9 ? pal.wallD : pal.wall); }
    }
  }
  function stairs(pl, x, y0, y1, dir, pal) {
    // steps cut into the wall between two terraces, going down in the direction dir
    const n = y1 - y0;
    for (let k = 0; k <= n; k++) { const xx = x + dir * Math.floor(k / 3); pl.rect(xx - 3, y0 + k, 7, 1, (k % 3 === 0) ? pal.lip : k % 3 === 1 ? pal.road : pal.road2); pl.set(xx - 4, y0 + k, pal.wallD); pl.set(xx + 4, y0 + k, pal.wallD); }
  }
  const PAL_H = { far: '#1C3438', pine: '#1E4238', pine2: '#2A5444', lip: '#5E9A4A', lip2: '#3E7448', road: '#8A6A44', road2: '#6A5034', wall: '#5A5470', wallHi: '#7A7490', wallD: '#3A3450' };
  const ROWS_H = [128, 170, 212, 254, 296];
  function paintHollow(save) {
    const W = 180, H = 316, r = rand(17), pl = new Spr(W, H, '#10182A');
    sky(pl, 0, 96, ['#0A1022', '#0E1628', '#132034', '#1A2C40'], r, 50);
    // the moon and a far ridge
    pl.ell(26, 16, 7, 7, '#E8E4D0'); pl.ell(28, 14, 6, 6, '#F6F2E0'); pl.set(24, 18, '#C8C4B0'); pl.set(27, 20, '#C8C4B0');
    for (let x = 0; x < W; x++) { const y = 62 + Math.round(Math.sin(x / 17) * 4 + Math.sin(x / 6) * 1.5); for (let yy = y; yy < 96; yy++) pl.set(x, yy, '#1A2A36'); }
    // Lantern Hill (right), rising from the camp
    const hy = x => x < 138 ? 99 : Math.round(84 - Math.sqrt(Math.max(0, 1 - ((x - 168) / 30) ** 2)) * 30);
    for (let x = 118; x < W; x++) { const y0 = hy(x); for (let y = y0; y < 96; y++) pl.set(x, y, y === y0 ? '#5E9A4A' : y < y0 + 3 ? '#3E7448' : ((x * 5 + y * 3) % 13 === 0 ? '#3A3450' : '#2A5440')); }
    // the camp ground (a plateau), its wall and the first stairs down (left)
    for (let x = 0; x < W; x++) { if (x >= 140) continue; pl.set(x, 84, PAL_H.lip); for (let y = 85; y < 88; y++) pl.set(x, y, (x * 3 + y) % 9 === 0 ? PAL_H.road2 : '#7A6040'); for (let k = 0; k < 8; k++) { const bx = (x + Math.floor(k / 3) * 3) % 7; pl.set(x, 88 + k, k === 0 ? PAL_H.wallHi : (bx === 0 || k % 3 === 2) ? PAL_H.wallD : PAL_H.wall); } }
    for (let x = 138; x < W; x++) for (let y = Math.min(hy(x), 84); y < 96; y++) pl.set(x, y, y === hy(x) ? '#5E9A4A' : '#2A5440');
    // terraces
    let top = 96;
    ROWS_H.forEach((gy, i) => { terrace(pl, gy, top, r, PAL_H); top = gy + 12; });
    // stairs: camp -> I (left), then alternate ends
    stairs(pl, 10, 85, ROWS_H[0], 0, PAL_H);
    ROWS_H.forEach((gy, i) => { const right = i % 2 === 0, x = right ? 170 : 10, y1 = i < 4 ? ROWS_H[i + 1] : H; stairs(pl, x, gy + 1, y1, 0, PAL_H); });
    // lamps and vignettes
    const sn = MAPDATA.snake(ROWS_H, 18, 162, 1, [], []);
    const lamps = sn.lamps.map((l, i) => ({ ...l, zone: i + 1 })), lights = [];
    for (const l of lamps) {
      const vg = vignette((l.zone - 1) % 7, r), dir = l.band % 2 === 0 ? 1 : -1;
      pl.stamp(vg, l.x + dir * 11 - vg.w / 2, l.y - vg.h + 1);
      l.lit = l.zone < save.maxZone; const s = lamp(l.lit);
      pl.stamp(s, l.x - 3, l.y - s.h + 2);
      if (l.lit) lights.push({ x: l.x + 2, y: l.y - 12, rx: 16, ry: 20, warm: 14, wy: 1.1, col: FL });
    }
    // stairs light up once the lamps on both ends are lit
    for (let i = 0; i < 5; i++) { const endZone = (i + 1) * 7; if (save.maxZone > endZone) lights.push({ x: i % 2 === 0 ? 170 : 10, y: ROWS_H[i] + 22, rx: 10, ry: 26, warm: 0 }); }
    if (save.maxZone > 1) lights.push({ x: 10, y: 106, rx: 10, ry: 26, warm: 0 });
    // the camp: lit by the fire and the windows; the moon lights the sky
    lights.push({ x: 84, y: 60, rx: 80, ry: 40, warm: 26, col: '#FF9A48' }, { x: 26, y: 16, r: 30 }, { x: 90, y: 20, rx: 90, ry: 26 }, { x: 168, y: 80, rx: 34, ry: 18 });
    const allLit = !!(save.lit && save.lit.hollow);
    if (allLit) lights.push({ x: 166, y: 34, r: 70, warm: 40, col: '#FFD27A' });
    const out = relight(pl, lights, { dark: night, half: halfN, edge: 5, dither: 1, allLit });
    const pins = [
      { id: 'tavern', at: [47, 84], spr: tavern(), label: 'Tavern', dot: save.dots.tavern },
      { id: 'rest', at: [90, 84], spr: rest(), label: "Hollow's Rest" },
      { id: 'well', at: [134, 84], spr: well(), label: 'Deepwell' },
      { id: 'sign', at: [12, 84], spr: sign(), label: 'Almanac', dot: save.dots.sign, lblDx: 10 },
      { id: 'lantern', at: [167, 55], spr: greatLantern(allLit, '#F2C14E'), label: 'Great Lantern', lbl: 'left' }
    ];
    return { plate: out, lamps, pins, rows: ROWS_H, W, H, flags: ROWS_H.map((y, i) => ({ band: i, y, open: save.maxZone > i * 7 })), glowLights: pl.lights.filter(l => lamps.length) };
  }
  const PAL_C = { far: '#1A3040', pine: '#1E3A3A', pine2: '#2A4A48', lip: '#6A9A7A', lip2: '#4A7A64', road: '#958A70', road2: '#6E6450', wall: '#5E6878', wallHi: '#8490A0', wallD: '#3A4254' };
  function paintCoast(save) {
    const W = 180, rows = [40, 82, 124, 166, 208], H = 276, r = rand(23), pl = new Spr(W, H, '#10182A');
    let top = 0;
    rows.forEach((gy, i) => {
      // the sea behind each terrace: horizon, waves
      for (let y = top; y < gy; y++) for (let x = 0; x < W; x++) pl.set(x, y, y < top + 6 ? '#16243A' : ((x * 3 + y * 5) % 17 === 0 || (y % 5 === 0 && (x + y * 2) % 11 < 3)) ? '#3A6A84' : '#1E3A54');
      for (let x = 0; x < W; x++) pl.set(x, top + 6, '#4A7A94');
      for (let x = 0; x < W; x++) { pl.set(x, gy, PAL_C.lip); for (let k = 1; k < 4; k++) pl.set(x, gy + k, k === 3 ? PAL_C.road2 : PAL_C.road); for (let k = 4; k < 12; k++) { const bx = (x + Math.floor((k - 4) / 3) * 3) % 7; pl.set(x, gy + k, k === 4 ? PAL_C.wallHi : (bx === 0 || (k - 4) % 3 === 2) ? PAL_C.wallD : PAL_C.wall); } }
      for (let k = 0; k < 5; k++) { const x = Math.floor(r() * W); pl.rect(x, gy - 4, 5, 4, PAL_C.wall); pl.hl(x, gy - 4, 5, PAL_C.wallHi); }
      top = gy + 12;
    });
    // below the last terrace: open sea, a rock, Saltreach Light (the Coast's Great Lantern)
    for (let y = 220; y < H; y++) for (let x = 0; x < W; x++) pl.set(x, y, y < 226 ? '#16243A' : ((x * 3 + y * 5) % 17 === 0 || (y % 5 === 0 && (x + y * 2) % 11 < 3)) ? '#3A6A84' : '#1E3A54');
    for (let x = 0; x < W; x++) pl.set(x, 226, '#4A7A94');
    pl.blob(120, 268, 26, 12, ['#6E6886', '#4A4562', '#2E2A40']); pl.rect(94, 268, 54, 8, '#2E2A40');
    rows.forEach((gy, i) => { const x = i % 2 === 0 ? 10 : 170; stairs(pl, x, gy + 1, i < 4 ? rows[i + 1] : 262, 0, PAL_C); });
    stairs(pl, 170, 0, rows[0], 0, PAL_C);
    const sn = MAPDATA.snake(rows, 18, 162, 0, [], []);
    const lamps = sn.lamps.map((l, i) => ({ ...l, zone: 36 + i })), lights = [];
    for (const l of lamps) { l.lit = l.zone < save.maxZone; const s = lamp(l.lit); pl.stamp(s, l.x - 3, l.y - s.h + 2); if (l.lit) lights.push({ x: l.x + 2, y: l.y - 12, rx: 16, ry: 20, warm: 14, wy: 1.1, col: FL }); }
    const out = relight(pl, lights, { dark: night, half: halfN, edge: 5, dither: 1 });
    return { plate: out, lamps, pins: [{ id: 'lantern', at: [120, 260], spr: greatLantern(false), label: 'Great Lantern' }], rows, W, H, flags: rows.map((y, i) => ({ band: 5 + i, y, open: save.maxZone > 35 + i * 7 })), glowLights: pl.lights };
  }
  function paintBeyond() {
    const W = 180, H = 90, r = rand(3), pl = new Spr(W, H);
    sky(pl, 0, 60, ['#0C0610', '#1A0A12', '#2E1016', '#48181A'], r, 12);
    for (let x = 0; x < W; x++) { const y = 44 + Math.round(Math.sin(x / 9) * 4 + (r() < 0.2 ? -3 : 0)); for (let yy = y; yy < 60; yy++) pl.set(x, yy, '#241018'); }
    for (let y = 60; y < H; y++) for (let x = 0; x < W; x++) pl.set(x, y, (x * 5 + y * 3) % 19 === 0 ? '#6A2A22' : y === 60 ? '#5A2A26' : '#2A1A1E');
    for (let k = 0; k < 18; k++) pl.set(Math.floor(r() * W), 62 + Math.floor(r() * 26), '#B8442E');
    for (let y = 60; y < 64; y++) pl.rect(0, y, 70, 1, y === 60 ? '#6A5E58' : '#4A3E3A');
    const out = pl.recolor(c => mix(c, '#0A0610', 0.35));
    return { plate: out, lamps: [], rows: [], W, H, flags: [], glowLights: [{ x: 132, y: 58, glow: 60, col: '#FF4A2A', ga: 0.45 }], pins: [{ id: 'raid', at: [132, 62], spr: wyrm(), label: 'Raid: the Ashen Wyrm', dot: 1, lit: 1 }, { id: 'gate', at: [70, 62], spr: gate(), label: 'Reach zone 71', dim: 1 }] };
  }

  // ================= five regions =================
  const RC = [
    { sky: ['#0A1022', '#132034', '#1A2C40'], back: 'pines', pal: PAL_H },
    { sky: ['#0A1022', '#132034', '#1A2C40'], back: 'sea', pal: PAL_C },
    { sky: ['#0C0610', '#2E1016', '#48181A'], back: 'ash', pal: { far: '#2A1418', pine: '#241018', pine2: '#3A1A1E', lip: '#6A4A42', lip2: '#4A2A26', road: '#6A5E58', road2: '#4A3E3A', wall: '#4A3A40', wallHi: '#6A5A60', wallD: '#2A2028' } },
    { sky: ['#0E1428', '#1C2A48', '#2E4064'], back: 'peaks', pal: { far: '#3A4A6A', pine: '#2A3A54', pine2: '#40506E', lip: '#E8EEF8', lip2: '#B8C4D8', road: '#8A8490', road2: '#5E5A6A', wall: '#6A7490', wallHi: '#9AA4C0', wallD: '#404A64' } },
    { sky: ['#06040A', '#0C0814', '#140E20'], back: 'cave', pal: { far: '#1A1428', pine: '#241C38', pine2: '#302648', lip: '#6A5A90', lip2: '#4A3E6A', road: '#5E567A', road2: '#3E3858', wall: '#3A3452', wallHi: '#5A5274', wallD: '#221E34' } }
  ];
  function regionTile(i, locked) {
    const R = RC[i], W = 60, H = 44, r = rand(60 + i), pl = new Spr(W, H, R.sky[0]), gy = 32;
    sky(pl, 0, gy, R.sky, r, i === 4 ? 0 : 14);
    if (R.back === 'pines') terrace(pl, gy, 4, r, R.pal);
    else {
      if (R.back === 'sea') for (let y = 12; y < gy; y++) for (let x = 0; x < W; x++) pl.set(x, y, y === 12 ? '#4A7A94' : ((x * 3 + y * 5) % 17 === 0) ? '#3A6A84' : '#1E3A54');
      if (R.back === 'ash') { for (let x = 0; x < W; x++) { const y0 = 20 + Math.round(Math.sin(x / 6) * 3); for (let y = y0; y < gy; y++) pl.set(x, y, R.pal.far); } pl.ell(44, 10, 5, 5, '#FF9E3D'); pl.ell(44, 10, 4, 4, '#FFC870'); }
      if (R.back === 'peaks') { for (const [cx, hh] of [[14, 22], [36, 26], [56, 18]]) pl.poly([cx, gy - hh, cx + 14, gy, cx - 14, gy], (x, y) => y < gy - hh + 6 ? '#E8EEF8' : x < cx ? '#6A7490' : '#4A5470'); for (let x = 0; x < W; x += 3) pl.set(x, 4 + (x % 5), '#7FE0C8'); }
      if (R.back === 'cave') { for (let x = 0; x < W; x++) { const h = 4 + ((x * 7) % 5) + (x % 11 === 0 ? 6 : 0); for (let y = 0; y < h; y++) pl.set(x, y, R.pal.pine); } for (const [x, h] of [[12, 8], [44, 10]]) pl.poly([x, gy - h, x + 3, gy, x - 3, gy], R.pal.pine2); for (const x of [26, 52]) { pl.vl(x, gy - 6, 6, '#B58CFF'); pl.vl(x + 1, gy - 4, 4, '#D8C8FF'); } }
      for (let x = 0; x < W; x++) { pl.set(x, gy, R.pal.lip); for (let k = 1; k < 4; k++) pl.set(x, gy + k, k === 3 ? R.pal.road2 : R.pal.road); for (let k = 4; k < 12; k++) { const bx = (x + Math.floor((k - 4) / 3) * 3) % 7; pl.set(x, gy + k, k === 4 ? R.pal.wallHi : (bx === 0 || (k - 4) % 3 === 2) ? R.pal.wallD : R.pal.wall); } }
    }
    const a = lamp(!locked), b = lamp(false); pl.stamp(a, 16 - 3, gy - a.h + 2); pl.stamp(b, 40 - 3, gy - b.h + 2);
    if (locked) return { plate: pl.recolor(c => mix(desat(c, 0.7), '#06060C', 0.7)), glow: [], pins: [{ at: [30, 40], spr: gate() }] };
    const lights = [{ x: 18, y: gy - 10, rx: 22, ry: 24, warm: 14, wy: 1.1, col: FL }];
    if (i === 2) lights.push({ x: 44, y: 10, r: 10 });
    const out = relight(pl, lights, { dark: night, half: halfN, edge: 5, dither: 1 });
    return { plate: out, glow: pl.lights };
  }

  const sheet = portrait => [
    { name: "Hollow's Rest", note: 'tents, a rope of lanterns over the fire', spr: rest(), dark: 1 },
    { name: 'The Tavern', note: 'two storeys of lit windows, mug sign', spr: tavern(), dark: 1 },
    { name: 'The Deepwell', note: 'well house, a beam of blue light', spr: well(), dark: 1 },
    { name: 'Great Lantern (lit)', note: 'lamp on a tall column', spr: greatLantern(true, '#F2C14E'), dark: 1 },
    { name: 'Great Lantern (dark)', note: 'cold glass', spr: greatLantern(false), dark: 1 },
    { name: 'Raid: the Ashen Wyrm', note: 'wings up on a burning crag', spr: wyrm(), dark: 1 },
    { name: 'Almanac post', note: 'notice board with its own lamp', spr: sign(), dark: 1 },
    { name: 'Road lamps', note: 'the tallest thing on each terrace', spr: lamp(true), spr2: lamp(false), dark: 1 },
    { name: 'You', note: 'your portrait as the lantern glass', spr: youFrame(portrait), dark: 1 },
    { name: 'Team out', note: 'walkers with a lantern on a pole', spr: team(), dark: 1 },
    { name: 'Band flag', note: 'open / locked', spr: flag(true), spr2: flag(false), dark: 1 },
    { name: 'Locked region', note: 'chained gate, dark lantern', spr: gate(), dark: 1 },
    { name: 'Zone vignettes', note: 'Mossy, Caves, Bones, Barrows, Fungal, Quarry, Marsh', spr: vignette(0), spr2: vignette(1), more: [2, 3, 4, 5, 6].map(t => vignette(t)), dark: 1 }
  ];
  const swatch = (w, h) => { const s = new Spr(w, h, '#1A2C40'); sky(s, 0, h - 5, ['#0E1628', '#132034', '#1A2C40'], rand(2), Math.floor(w * h / 120)); for (let x = 0; x < w; x++) { s.set(x, h - 5, PAL_H.lip); for (let y = h - 4; y < h; y++) s.set(x, y, y === h - 1 ? PAL_H.road2 : PAL_H.road); } return s; };
  return {
    key: 'C', name: 'Lamplit terraces', pitch: 'The region at night, seen from the side like the fight stage: the road zigzags down the hill in stone terraces, one tall lamp per zone with a picture of its zone. Lit lamps light their terrace; the rest is cold blue.',
    paintHollow, paintCoast, paintBeyond, sheet, swatch, youFrame, team, flag, glowK: 1.1, P, regionTile,
    youTip: l => [l.x + (l.band % 2 === 0 ? -10 : 13), l.y + 3], teamAt: (res, band) => [band % 2 === 0 ? 34 : 146, res.rows[band] + 3], flagDy: 34, zrDy: 10
  };
})();
