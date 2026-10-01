// 63c-scenery-gather: the gathering scenes (plan-3 ask 3, task G2). Browser-only.
// Each node family gets a place, not a node on a platform:
//   gmine    ore        a lantern-lit mine: timber frames, a side tunnel, rails and an ore cart, veins in the walls
//   gwoods   wood       a clearing in the woods: trees at depth, old stumps, a chopping block, a woodpile
//   gmeadow  fibre/herb an evening meadow: a windmill and a farm on the hills, a fence with lamp posts, a basket
//   gglade   crystal    a moonlit glade: standing stones, crystals in the grass, warm lamps on the path, a crate
// The static layers (sky, far, mid, ground, foreground) are painted here and registered with
// registerSceneTheme (63-scenery), so they are baked, packed into device-size plates and drawn 1:1
// like every other scene (docs/design/perf.md). The ambient motion (drips, dust, leaves, fireflies,
// pollen) is 63-scenery's particle kinds, static under prefers-reduced-motion.
//
// The nodes are drawn live on top (they change): 3-5 nodes of the picked kind and tier in two lanes
// (the back lane a little higher and dimmer), plus one or two further off at half size. The worked node is the stage's own foe sprite (62-stage
// asks gatherSpot for its place); the rest are drawn here. While S.gProg builds, the worked node
// shows cracks (rock), a notch (tree) or cuts (plants). A finished gather (the 'harvest' event)
// leaves it spent (an empty vein, a stump, stubble) and it grows back over REGROW s; the next full
// node becomes the worked one and the hero walks there. The cart, woodpile, basket or crate fills
// as you gather. The Glint shows on the worked vein: a gold glow and twinkles over it (tap it).
// Presentation only: yields, timing and the Glint's rules are the core's (50-sim, 55-gathering).
//
// Globals (62-stage calls them at small hooks):
//   gatherTheme(kind) -> scene theme       gatherSpot(SW, GY) -> { x, y } the worked node's feet
//   gatherHeroX(x) -> x                    the hero's x while it walks to its node (x: where it stands)
//   gatherWalking() -> bool                the hero is walking between nodes
//   gatherRight(x) -> x                    the worked row's right edge (the cold Hearth's plots stand past it)
//   gatherDraw(ctx, scene, cam, part, s)   part 'back': piles, shadows and the other nodes (before the
//                                          worked node); 'front': nodes in front of it, its cracks, the
//                                          Glint and node lights. s: the stage's foe record (dX, dY, dF)
let gatherTheme, gatherSpot, gatherHeroX, gatherWalking, gatherDraw, gatherRight;
{
  const THEME = { ore: 'gmine', crystal: 'gglade', wood: 'gwoods', fibre: 'gmeadow', herb: 'gmeadow' };
  gatherTheme = k => { const kind = gatherArtKind(k); return kind === 'hide' ? null : THEME[kind] || (skillOf(kind) === 'mine' ? 'gmine' : 'gwoods'); };
  const REDUCED = typeof reduced !== 'undefined' ? reduced : false;

  // =====================================================================================
  // Static scenes (art px, 2 CSS px each; see 63-scenery for the layer and light helpers)
  // =====================================================================================
  // a seam of ore in rock: a wavy flat streak with a lit pixel (L: layer)
  function vein(A, L, x, y, hex, len, lit) {
    const { C, flat, blend, light } = A, m = flat(C(hex), { nl: 0 }), hi = flat(blend(C(hex), [255, 255, 240], 0.55));
    x = Math.round(x); y = Math.round(y);
    for (let i = 0; i < len; i++) { const yy = y + Math.round(Math.sin(i * 0.9 + x) * 1.2); L.px(x + i, yy, m); if (i % 3 === 1) L.px(x + i, yy - 1, m); }
    L.px(x + (len >> 1), y, hi);
    if (lit) light(L, x + (len >> 1), y, 12, { rgb: C(hex), a: 0.35, core: 0.3, flick: 0, kind: 'crystal', pool: 0.2 });
  }

  // ----------------------------- the mine -----------------------------
  function paintMine(A) {
    const { th, r, C, X, Ha, LW, G, PX, M, far, mid, gnd, mat, matS, flat, tinted, hz, ramp, blend, desat, light, lantern, hang, ceilY,
      farBack, farFront, farDark, iron, ironL, glass, hot, pathM, pathTop, pathBot, drips, band } = A;
    // -- far: the back wall, strata, receding timber frames and a side tunnel with a lamp deep inside --
    for (let x = 0; x < LW; x++) far.rect(x, 0, 1, Math.round(ceilY(x)), farFront);
    far.fillFrom(x => ceilY(x), G, farBack);
    const strata = flat(hz(th.far, 0, 0.6)), strataD = flat(ramp(C(th.far))[2]);
    for (let y = Math.round(Ha * 0.22); y < G - 4; y += 6 + Math.round(r() * 4)) for (let x = r() * 10; x < LW; x += 10 + r() * 16) { const w = 5 + r() * 12; far.rect(x, y, w, 1, strataD); far.rect(x + 1, y - 1, w - 2, 1, strata); }
    const specks = ['#D08A4E', '#A9B1BD', '#7FD6E0'].map(h => flat(blend(C(h), C(th.far), 0.45)));
    for (let i = 0; i < LW / 6; i++) { const x = r() * LW, y = Ha * 0.2 + r() * (G - Ha * 0.26); far.px(x, y, specks[i % 3]); if (r() < 0.4) far.px(x + 1, y + 1, specks[i % 3]); }
    const postF = matS(hz(th.wood, 0.45)), beamF = Math.round(Ha * 0.32);
    far.rect(0, beamF - 1, LW, 2, postF);
    for (const fx of [0.12, 0.34, 0.8, 1.02]) { const x = Math.round(X(fx)); far.rect(x - 1, beamF, 2, G - beamF, postF); far.line(x - 6, beamF + 1, x - 1, beamF + 6, 1, postF); far.line(x + 6, beamF + 1, x + 1, beamF + 6, 1, postF); }
    for (const fx of [0.12, 0.8]) { const x = Math.round(X(fx)); far.rect(x - 1, beamF + 3, 3, 2, glass); far.px(x, beamF + 3, hot); light(far, x, beamF + 4, 10, { core: 0.5, a: 0.5, pool: 0.22 }); }
    // the side tunnel: a dark mouth, two frames going away, rails into it and a lamp far inside
    const tx = Math.round(X(0.58)), tw = 13, tTop = Math.round(G - Ha * 0.27);
    const deep = flat(blend(C(th.sky[0]), [0, 0, 0], 0.4));
    far.poly([tx - tw, G, tx - tw, tTop + 6, tx - tw + 5, tTop, tx + tw - 5, tTop, tx + tw, tTop + 6, tx + tw, G], farDark);
    far.poly([tx - 7, G - 1, tx - 7, tTop + 10, tx - 4, tTop + 7, tx + 4, tTop + 7, tx + 7, tTop + 10, tx + 7, G - 1], deep);
    const postN = matS(hz(th.wood, 0.3)), postD = matS(hz(th.wood, 0.65));
    far.rect(tx - tw - 1, tTop + 2, 3, G - tTop - 2, postN); far.rect(tx + tw - 1, tTop + 2, 3, G - tTop - 2, postN); far.rect(tx - tw - 2, tTop, 2 * tw + 5, 3, postN);
    far.rect(tx - 7, tTop + 8, 2, G - tTop - 9, postD); far.rect(tx + 6, tTop + 8, 2, G - tTop - 9, postD); far.rect(tx - 8, tTop + 7, 17, 2, postD);
    const railF = flat(hz('#8A8494', 0.5));
    far.line(tx - 9, G, tx - 3, G - 5, 1, railF); far.line(tx + 9, G, tx + 3, G - 5, 1, railF);
    far.rect(tx - 1, tTop + 13, 3, 2, glass); far.px(tx, tTop + 13, hot);
    light(far, tx, tTop + 14, 18, { a: 0.55, core: 0.5, pool: 0.35 });
    // -- mid: the ceiling with stalactites, rock walls at both sides (veins in them), timber supports --
    const rk = mat(desat(C(th.rock), 0.8), 'vol', { wide: 1 }), rk2 = mat(desat(C(th.rock2), 0.8), 'vol', { sep: 1 });
    mid.grp(() => { for (let x = 0; x < LW; x++) mid.rect(x, 0, 1, Math.round(5 + Math.sin(x * 0.13 + 1) * 2 + Math.sin(x * 0.31) * 1.5), rk); });
    for (let x = r() * 5; x < LW; x += 5 + r() * 8) {
      const len = band(x) ? 3 + r() * 6 : 6 + r() * 14;
      mid.tri(x, 4, len, 1.5 + r() * 2, r() < 0.5 ? rk : rk2, true);
      if (r() < 0.6) drips.push({ x: (x + 0.5) * PX, y: (4 + len) * PX, f: 0.5 });
    }
    const xl = X(0.075), xr = X(0.925);
    mid.grp(() => mid.poly([0, 0, xl + 3, 0, xl - 2, Ha * 0.3, xl + 2, Ha * 0.52, xl - 1, G * 0.8, xl + 4, G + 1, 0, G + 1], rk));
    mid.grp(() => mid.poly([LW, 0, xr - 3, 0, xr + 2, Ha * 0.28, xr - 2, Ha * 0.5, xr + 1, G * 0.78, xr - 4, G + 1, LW, G + 1], rk));
    for (let k = 0; k < 5; k++) { mid.oval(X(0.01) + r() * 8, Ha * (0.22 + k * 0.15), 4 + r() * 3, 3 + r() * 2, rk2); mid.oval(X(0.99) - r() * 8, Ha * (0.2 + k * 0.15), 4 + r() * 3, 3 + r() * 2, rk2); }
    // ore veins in the walls (a couple glow faintly)
    const oreHex = ['#C07A42', '#A8B0C0', '#86D0DE', '#B0A0EA'];
    for (let k = 0; k < 4; k++) { vein(A, mid, X(0.0) + r() * 6 - 4, Ha * (0.26 + k * 0.15), oreHex[k % 4], 5 + r() * 5, k === 2); vein(A, mid, X(0.94) + r() * 5, Ha * (0.24 + k * 0.16), oreHex[(k + 1) % 4], 5 + r() * 5, k === 1); }
    // timber supports: posts, the cap beam, braces, iron straps
    const wood = mat(desat(C(th.wood), 0.85), 'vol', { wide: 1 }), beamY = Math.round(Ha * 0.17);
    for (const fx of [0.085, 0.5, 0.915]) { const x = Math.round(X(fx)); mid.grp(() => mid.rect(x - 2, beamY, 4, G - beamY + 1, wood)); }
    mid.grp(() => mid.rect(0, beamY - 2, LW, 4, wood));
    for (const fx of [0.085, 0.5, 0.915]) {
      const x = Math.round(X(fx));
      mid.line(x - 9, beamY + 2, x - 2, beamY + 9, 2, wood); mid.line(x + 9, beamY + 2, x + 2, beamY + 9, 2, wood);
      for (const y of [beamY + 12, Math.round((beamY + G) / 2), G - 6]) mid.rect(x - 2, y, 4, 1, ironL);
    }
    // hanging lanterns on the beam, a bracket lantern on the right wall
    hang(mid, X(0.25), beamY + 2, 6, { r: 38 }); hang(mid, X(0.4), beamY + 2, 3, { r: 28 }); hang(mid, X(0.72), beamY + 2, 8, { r: 38 });
    { const x = Math.round(X(0.925)) - 3, y = Math.round(G - Ha * 0.3); mid.rect(x - 4, y, 5, 1, iron); mid.px(x, y + 1, iron); lantern(mid, x - 4, y + 1, { r: 30, gnd: 12 }); }
    // tools against the middle post: a pick and a shovel
    { const x = Math.round(X(0.5)) - 3, hdl = mat('#8A6A44'), hd = mat('#7C7888', 'vol', { sep: 1 });
      mid.line(x, G, x - 4, G - 15, 1, hdl); mid.line(x - 8, G - 14, x - 1, G - 17, 2, hd); mid.px(x - 9, G - 13, hd);
      mid.line(x + 7, G, x + 8, G - 16, 1, hdl); mid.grp(() => { mid.rect(x + 6, G - 4, 4, 4, hd); mid.rect(x + 7, G - 5, 2, 1, hd); }); mid.rect(x + 7, G - 18, 3, 1, hdl); }
    // crates with a lamp at the right
    { const x = Math.round(X(0.84)), cr = mat('#6A4C34', 'vol', { sep: 1 }), band2 = flat(ramp(C('#6A4C34'))[3], { nl: 0 });
      mid.rect(x - 7, G - 7, 8, 8, cr); mid.rect(x + 1, G - 6, 7, 7, cr); mid.rect(x - 4, G - 13, 7, 6, cr);
      for (const [bx, by, bw] of [[x - 7, G - 4, 8], [x + 1, G - 3, 7], [x - 4, G - 10, 7]]) mid.rect(bx, by, bw, 1, band2);
      lantern(mid, x - 1, G - 20, { r: 26 }); }
    // -- ground: the tunnel floor, rails with the cart on them, puddles, rubble, a floor lamp --
    gnd.grp(() => gnd.rect(0, pathTop, LW, pathBot - pathTop, pathM));
    const grit = flat(ramp(C(th.path))[0]); for (let i = 0; i < LW / 5; i++) gnd.px(r() * LW, pathTop + 1 + r() * (pathBot - pathTop - 2), grit);
    const rail = flat(ramp(C('#6E6878'))[1], { nl: 0 }), railHi = flat(ramp(C('#6E6878'))[0], { nl: 0 }), sleeper = mat(desat(C(th.wood), 0.6));
    const ry = pathBot + 13;
    for (let x = 1; x < LW; x += 5) gnd.rect(x, ry - 1, 3, 4, sleeper);
    gnd.rect(0, ry, LW, 1, railHi); gnd.rect(0, ry + 2, LW, 1, rail);
    const water = flat(blend(C('#1A2232'), C(th.gnd), 0.4)), shine = flat(blend(C('#7FA8D0'), C(th.gnd), 0.45));
    for (const fx of [0.46, 0.82]) { const x = Math.round(X(fx)), y = pathBot + 4 + Math.round(r() * 3); gnd.rect(x - 5, y, 11, 1, water); gnd.rect(x - 3, y + 1, 7, 1, water); gnd.rect(x - 1, y, 2, 1, shine); }
    const rub = flat(ramp(desat(C(th.rock2), 0.6))[2], { nl: 1 }), rubL = flat(ramp(desat(C(th.rock2), 0.6))[1], { nl: 1 });
    for (let i = 0; i < LW / 10; i++) { const x = r() * LW, y = pathBot + 2 + r() * (Ha - pathBot - 3); if (Math.abs(y - ry - 1) < 3) continue; gnd.rect(x, y, 2, 1, rub); gnd.px(x, y - 1, rubL); }
    // the cart (its load is drawn live: out.cart)
    const cx = Math.round(X(0.16)), cartM = mat('#5A4636', 'vol', { wide: 1 }), bandM = mat(th.iron, 'vol'), rim = ry - 12;
    gnd.grp(() => gnd.poly([cx - 10, rim, cx + 10, rim, cx + 8, ry - 3, cx - 8, ry - 3], cartM));
    gnd.rect(cx - 11, rim, 22, 1, bandM); gnd.rect(cx - 9, ry - 6, 18, 1, bandM);
    for (const k of [-5, 5]) { gnd.rect(cx + k, rim + 1, 1, ry - 4 - rim, flat(ramp(C('#5A4636'))[3], { nl: 0 })); }
    gnd.oval(cx - 5, ry - 1, 2, 2, iron); gnd.oval(cx + 5, ry - 1, 2, 2, iron); gnd.px(cx - 5, ry - 1, ironL); gnd.px(cx + 5, ry - 1, ironL);
    gnd.rect(cx + 10, rim - 9, 1, 10, ironL); gnd.rect(cx + 10, rim - 9, 3, 1, ironL); lantern(gnd, cx + 13, rim - 8, { r: 28, pool: 0.3 });
    A.out.pile = { kind: 'cart', x: (cx + 0.5) * PX - M, y: rim * PX, w: 18 * PX };
    // a lantern standing on the floor at the right
    lantern(gnd, Math.round(X(0.975)), pathBot - 5, { r: 26, gnd: 10 });
  }
  function fgMine(A) {
    const { X, Ha, fg, fgId, iron, lantern } = A;
    fg.tri(X(-0.02) + 5, 0, Ha * 0.2, 7, fgId, true); fg.tri(X(-0.02) + 14, 0, Ha * 0.1, 4, fgId, true); fg.tri(X(1.0), 0, Ha * 0.16, 6, fgId, true);
    fg.oval(X(-0.02) + 4, Ha + 1, 11, 6, fgId, 'top'); fg.oval(X(0.99), Ha + 1, 9, 5, fgId, 'top');
    // a chain from the roof with a lamp, near the viewer (top right)
    const cx = Math.round(X(0.985)) - 4, cl = Math.round(Ha * 0.11);
    for (let y = 0; y < cl; y++) fg.px(cx, y, iron);
    lantern(fg, cx, cl + 1, { r: 30, pool: 0.25 });
  }

  // ----------------------------- the woods -----------------------------
  function paintWoods(A) {
    const { th, r, C, X, Ha, LW, G, PX, M, far, mid, gnd, mat, matS, flat, hz, ramp, blend, desat, light, lantern, lampPost, rope, windowLit,
      farLamp, pine, ridgeY, farBack, farFront, iron, pathM, pathTop, pathBot } = A;
    // -- far: two rows of trees, a woodcutter's cabin on the rise, lamps along a track --
    far.fillFrom(x => ridgeY(x, G - Ha * 0.24, 3), G, farBack);
    for (let x = r() * 4; x < LW; x += 4 + r() * 5) { const b = ridgeY(x, G - Ha * 0.24, 3) + 3; pine(far, x, b, 12 + r() * 14, farBack); }
    { const x = Math.round(X(0.72)), b = Math.round(ridgeY(X(0.72), G - Ha * 0.24, 3)) + 1, wall = matS(hz('#5A4232', 0.3)), roof = matS(hz('#3A2A2A', 0.3));
      far.rect(x - 7, b - 8, 14, 9, wall); far.poly([x - 9, b - 8, x, b - 15, x + 9, b - 8], roof); far.rect(x + 4, b - 16, 2, 5, roof);
      windowLit(far, x - 5, b - 6, 2, 2, { r: 10, a: 0.5 }); windowLit(far, x + 2, b - 6, 3, 3, { r: 12, a: 0.55 }); }
    far.fillFrom(x => ridgeY(x + 211, G - Ha * 0.11, 2), G, farFront);
    for (let x = r() * 6; x < LW; x += 7 + r() * 8) { const b = ridgeY(x + 211, G - Ha * 0.11, 2) + 2, h = 8 + r() * 10; far.rect(x, b - h * 0.5, 1, h * 0.5, farFront); far.oval(x, b - h * 0.6, 3 + r() * 3, h * 0.35, farFront); }
    for (const fx of [0.2, 0.47]) farLamp(Math.round(X(fx)), Math.round(ridgeY(X(fx) + 211, G - Ha * 0.11, 2)) - 3);
    // -- mid: big trunks at the edges, a canopy with a gap over the clearing, trees at depth --
    const bark = mat(desat(C(th.bark), 0.85), 'vol', { wide: 1 }), groove = flat(ramp(C(th.bark))[3], { nl: 0 });
    const leaf = mat(desat(C(th.leaf), 0.85), 'vol', { sep: 1 }), leaf2 = mat(desat(C(th.leaf2), 0.85), 'vol', { sep: 1 });
    const barkH = mat(desat(hz(th.bark, 0.28), 0.8), 'vol', { wide: 1 }), leafH = mat(desat(hz(th.leaf, 0.3), 0.8), 'vol', { sep: 1 }), leafH2 = mat(desat(hz(th.leaf2, 0.3), 0.8), 'vol', { sep: 1 });
    // trees at depth (hazed), then the near trunks
    const back = (x, h, w) => {
      x = Math.round(x);
      mid.grp(() => { mid.rect(x, G - h, w, h + 1, barkH); mid.tri(x + w / 2, G - 4, 5, w * 0.8, barkH); });
      mid.grp(() => { for (let k = 0; k < 6; k++) mid.oval(x + w / 2 + (r() - 0.5) * 18, G - h - 2 + (r() - 0.3) * 10, 6 + r() * 4, 4 + r() * 3, k % 2 ? leafH : leafH2); });
    };
    back(X(0.27), Ha * 0.46, 4); back(X(0.63), Ha * 0.52, 5); back(X(0.81), Ha * 0.4, 3);
    const trunk = (x, w) => { x = Math.round(x); mid.grp(() => { mid.rect(x, 0, w, G + 1, bark); mid.tri(x + w / 2, G - 6, 7, w * 0.8, bark); }); for (let k = 2; k < w - 2; k += 3) { let y = r() * 8; while (y < G - 6) { const l = 4 + r() * 12; mid.rect(x + k, y, 1, l, groove); y += l + 3 + r() * 6; } } };
    const tL = X(-0.04), tR = X(0.955);
    trunk(tL, 15); trunk(tR, 14);
    for (let x = -6; x < LW + 8; x += 6 + r() * 5) {
      const edge = Math.min(Math.abs(x - X(0.08)), Math.abs(x - X(0.92))) / (X(0.5) - X(0.08));   // 0 at the edges, 1 in the middle
      if (edge > 0.55 && r() < 0.7) continue;    // the clearing: a gap in the canopy
      const y = Ha * 0.02 + r() * Ha * (0.08 - edge * 0.06);
      mid.oval(x, y, 7 + r() * 5 - edge * 3, 5 + r() * 4 - edge * 2, r() < 0.5 ? leaf : leaf2);
    }
    for (const x of [X(0.02), X(0.98)]) for (let k = 0; k < 4; k++) mid.oval(x + (r() - 0.5) * 16, Ha * (0.12 + k * 0.06), 6 + r() * 3, 4 + r() * 2, k % 2 ? leaf : leaf2);
    // lanterns: on the trunks, a post in the clearing, a string of little lamps across it
    const bracket = (x, y, dir) => { mid.rect(dir > 0 ? x : x - 4, y, 5, 1, iron); lantern(mid, x + dir * 4, y + 1, { r: 32, gnd: 12 }); };
    bracket(tL + 15, Math.round(G - 34), 1); bracket(tR, Math.round(G - 40), -1);
    lampPost(mid, Math.round(X(0.44)), G + 1, 30, { r: 32, dir: -1 });
    mid.line(tL + 14, Math.round(Ha * 0.27), tL + 24, Math.round(Ha * 0.25), 2, bark); mid.line(tR, Math.round(Ha * 0.24), tR - 9, Math.round(Ha * 0.22), 2, bark);
    rope(mid, tL + 22, Math.round(Ha * 0.26), tR - 7, Math.round(Ha * 0.23), 9, 4, { r: 16, a: 0.4 });
    // a chopping block with an axe in it (left) and a sawhorse with a log (right)
    { const x = Math.round(X(0.3)), blk = mat('#6E5038', 'vol', { wide: 1 }), top = flat('#D8B47A', { nl: 0 }), ringC = flat('#A8845A', { nl: 0 });
      mid.grp(() => { mid.rect(x - 4, G - 6, 9, 7, blk); }); mid.rect(x - 4, G - 7, 9, 1, top); mid.px(x, G - 7, ringC);
      const hdl = mat('#9A7A50'), hd = mat('#8A8898', 'vol', { sep: 1 });
      mid.line(x + 1, G - 8, x + 6, G - 17, 1, hdl); mid.grp(() => { mid.rect(x - 1, G - 9, 4, 2, hd); mid.px(x - 2, G - 9, hd); }); }
    { const x = Math.round(X(0.86)), leg = mat('#5A4030'), lg = mat('#7A5A3A', 'vol', { sep: 1 }), end = flat('#D8B47A', { nl: 0 });
      mid.line(x - 6, G, x - 3, G - 7, 1, leg); mid.line(x, G, x - 3, G - 7, 1, leg); mid.line(x + 6, G, x + 9, G - 7, 1, leg); mid.line(x + 12, G, x + 9, G - 7, 1, leg);
      mid.grp(() => mid.rect(x - 7, G - 10, 20, 3, lg)); mid.rect(x + 13, G - 10, 1, 3, end); }
    // late sun through the gap in the canopy, baked into the layers (no per-frame shafts)
    const sun = [255, 236, 180];
    light(far, X(0.52), G - Ha * 0.12, 90, { rgb: sun, a: 0.2, core: 0, flick: 0, pool: 0.22, px: 0.7, py: 1.2, kind: 'sun', bakeOnly: 1 });
    light(mid, X(0.55), G - Ha * 0.3, 80, { rgb: sun, a: 0.2, core: 0, flick: 0, pool: 0.16, px: 0.6, py: 1.3, kind: 'sun', bakeOnly: 1 });
    light(gnd, X(0.56), G + 3, 70, { rgb: sun, a: 0.2, core: 0, flick: 0, pool: 0.28, px: 1.1, py: 0.35, kind: 'sun', bakeOnly: 1 });
    // ferns and bushes at the trunks' feet
    for (const [fx, rx] of [[0.04, 9], [0.96, 10], [0.36, 4], [0.7, 5]]) mid.oval(X(fx), G - 1, rx, rx * 0.6, leaf2, 'top');
    // -- ground: grass, a trodden clearing, chips, flowers, old stumps near the viewer --
    gnd.grp(() => { for (let x = 0; x < LW; x++) for (let y = pathTop + ((x * 7 + 3) % 11 < 2 ? 1 : 0); y < pathBot; y++) gnd.span(x, x + 1, y, pathM, gnd.pc); });
    const chip = flat('#D8B47A'), chipD = flat('#A8845A'), fl1 = flat('#E8B070'), fl2 = flat('#C8A0E0'), fl3 = flat('#F2E6A0');
    for (let i = 0; i < LW / 5; i++) gnd.px(r() * LW, pathTop + 1 + r() * (pathBot - pathTop - 1), r() < 0.5 ? chip : chipD);
    for (let i = 0; i < LW / 8; i++) gnd.px(r() * LW, pathBot + 2 + r() * (Ha - pathBot - 3), [fl1, fl2, fl3][i % 3]);
    const stumpM = mat('#6A4A30', 'vol', { wide: 1 }), stumpT = flat('#C8A070', { nl: 0 }), stumpR = flat('#9A7650', { nl: 0 });
    for (const [fx, w] of [[0.38, 7], [0.74, 5], [0.58, 4]]) { const x = Math.round(X(fx)), y = pathBot + 8 + Math.round(r() * 4); gnd.grp(() => gnd.rect(x - (w >> 1), y - 3, w, 4, stumpM)); gnd.rect(x - (w >> 1), y - 4, w, 1, stumpT); gnd.px(x, y - 4, stumpR); }
    // the woodpile (drawn live with its stakes: out.pile; at the cold Hearth it moves aside for the fire)
    const px = Math.round(X(0.15)), pb = pathBot + 10;
    A.out.pile = { kind: 'logs', x: (px + 0.5) * PX - M, y: pb * PX };
  }
  function fgWoods(A) {
    const { th, C, X, Ha, fg, mat, desat, fgId, iron, lantern, tuft, blend } = A;
    // leaves hanging into view at the top corners
    const lf = mat(blend(desat(C(th.leaf2), 0.8), [6, 4, 10], 0.45), 'vol', { sep: 1 });
    for (let k = 0; k < 4; k++) { fg.oval(X(-0.02) + k * 6, 2 + (k % 2) * 4, 7, 5, lf); fg.oval(X(1.0) - k * 6, 1 + (k % 2) * 5, 7, 5, lf); }
    fg.oval(X(-0.02), Ha + 1, 12, 8, fgId, 'top'); fg.oval(X(0.04), Ha + 2, 7, 5, fgId, 'top'); tuft(X(0.9), 5, 6); tuft(X(0.5), 2, 3);
    const fx = Math.round(X(0.985)), post = mat(blend(C('#5A4030'), [6, 4, 10], 0.4));
    fg.grp(() => { fg.rect(fx, Ha - 16, 3, 16, post); fg.rect(fx - 12, Ha - 11, 12, 2, post); fg.rect(fx - 12, Ha - 6, 12, 2, post); });
    fg.rect(fx - 2, Ha - 16, 3, 1, iron); lantern(fg, fx - 2, Ha - 14, { r: 26, pool: 0.3 });
  }

  // ----------------------------- the meadow and the glade -----------------------------
  function paintMeadow(A, glade) {
    const { th, r, C, X, Ha, LW, G, PX, M, far, mid, gnd, mat, matS, flat, tinted, hz, ramp, blend, desat, light, lantern, lampPost, rope, hang, windowLit,
      farLamp, ridgeY, farBack, farFront, farDark, iron, ironL, glass, hot, pathM, pathTop, pathBot } = A;
    const cry = C(th.crystal || '#8FD8FF'), cryM = tinted(desat(cry, 0.85)), cryD = tinted(blend(cry, C(th.far), 0.5));
    // -- far: rolling hills --
    far.fillFrom(x => ridgeY(x, G - Ha * 0.3, 6), G, farBack);
    far.fillFrom(x => ridgeY(x + 300, G - Ha * 0.15, 4), G, farFront);
    const hedge = flat(hz(glade ? th.far2 : '#2E4A34', 0.35), { nl: 1 });
    for (let x = r() * 4; x < LW; x += 3 + r() * 3) far.oval(x, ridgeY(x + 300, G - Ha * 0.15, 4) + 1, 2 + r() * 2, 1.5 + r(), hedge, 'top');
    if (!glade) {
      // a windmill on the far hill, a farm on the near one
      const wx = Math.round(X(0.28)), wb = Math.round(ridgeY(X(0.28), G - Ha * 0.3, 6)) + 2, tower = matS(hz('#6A5648', 0.3)), cap = matS(hz('#3E2E30', 0.3)), sail = flat(hz('#C8B89A', 0.45), { nl: 1 });
      far.poly([wx - 5, wb, wx - 3, wb - 18, wx + 3, wb - 18, wx + 5, wb], tower); far.poly([wx - 4, wb - 18, wx, wb - 22, wx + 4, wb - 18], cap);
      for (const [dx, dy] of [[-9, -9], [9, -9], [9, 9], [-9, 9]]) far.line(wx, wb - 19, wx + dx, wb - 19 + dy, 1, sail);
      windowLit(far, wx - 1, wb - 9, 2, 2, { r: 10, a: 0.5 });
      const fx0 = Math.round(X(0.74)), fb = Math.round(ridgeY(X(0.74) + 300, G - Ha * 0.15, 4)) + 1, wall = matS(hz('#7A6450', 0.25)), roof = matS(hz('#5A3430', 0.25));
      far.rect(fx0 - 9, fb - 8, 18, 9, wall); far.poly([fx0 - 11, fb - 8, fx0 - 2, fb - 14, fx0 + 7, fb - 14, fx0 + 11, fb - 8], roof); far.rect(fx0 + 5, fb - 17, 2, 4, roof);
      windowLit(far, fx0 - 6, fb - 6, 2, 2, { r: 10, a: 0.55 }); windowLit(far, fx0 + 3, fb - 6, 2, 2, { r: 10, a: 0.55 });
      for (const fx of [0.1, 0.93]) farLamp(Math.round(X(fx)), Math.round(ridgeY(X(fx) + 300, G - Ha * 0.15, 4)) - 3);
    } else {
      // standing stones on the far hill, crystals catching the moon
      for (const fx of [0.3, 0.7]) { const x = Math.round(X(fx)), b = Math.round(ridgeY(x, G - Ha * 0.3, 6)) + 2; far.rect(x - 5, b - 9, 3, 9, farFront); far.rect(x + 3, b - 9, 3, 9, farFront); far.rect(x - 6, b - 11, 13, 2, farFront); }
      for (const fx of [0.18, 0.5, 0.84]) { const x = Math.round(X(fx)), b = Math.round(ridgeY(x, G - Ha * 0.3, 6)) + 2; far.rect(x - 1, b - 5, 2, 5, farFront); }
      for (const fx of [0.12, 0.47, 0.86]) { const x = Math.round(X(fx)), b = Math.round(ridgeY(x + 300, G - Ha * 0.15, 4)) + 1; far.tri(x, b - 5, 5, 1, cryD); far.tri(x + 2, b - 3, 3, 1, cryM); light(far, x, b - 3, 12, { rgb: cry, a: 0.4, core: 0.3, flick: 0, kind: 'crystal', pool: 0.2 }); }
      farLamp(Math.round(X(0.6)), Math.round(ridgeY(X(0.6) + 300, G - Ha * 0.15, 4)) - 3);
    }
    // -- mid --
    const bark = mat(desat(C(th.bark), 0.8), 'vol', { wide: 1 }), leaf = mat(desat(C(th.leaf), 0.85), 'vol', { sep: 1 }), leaf2 = mat(desat(C(th.leaf2), 0.85), 'vol', { sep: 1 });
    // a lone tree at the left edge (a birch in the glade) with a lantern on a branch
    { const x = Math.round(X(0.0)), trunkM = glade ? mat('#C8C8D0', 'vol', { wide: 1 }) : bark, mark = flat(glade ? '#3A3A48' : ramp(C(th.bark))[3], { nl: 0 });
      mid.grp(() => { mid.rect(x - 3, Math.round(Ha * 0.2), 7, G - Math.round(Ha * 0.2) + 1, trunkM); mid.tri(x + 0.5, G - 5, 6, 6, trunkM); });
      for (let y = Math.round(Ha * 0.24); y < G - 4; y += 5 + Math.round(r() * 5)) mid.rect(x - 2 + Math.round(r() * 3), y, 2, 1, mark);
      mid.line(x + 3, Math.round(Ha * 0.34), x + 14, Math.round(Ha * 0.3), 2, trunkM);
      const lc = glade ? mat(desat(blend(C(th.leaf), cry, 0.25), 0.7), 'vol', { sep: 1 }) : leaf;
      for (let k = 0; k < 9; k++) mid.oval(x + (r() - 0.35) * 26, Ha * (0.1 + r() * 0.16), 7 + r() * 4, 5 + r() * 3, k % 2 ? lc : leaf2);
      hang(mid, x + 12, Math.round(Ha * 0.31), 5, { r: 32 }); }
    if (!glade) {
      // a rail fence across the back, lamp posts on it, a string of paper lanterns, hay bales
      const rail = mat('#7A5E40', 'vol', { sep: 1 }), post = mat('#5E4430', 'vol');
      mid.grp(() => { mid.rect(X(0.06), G - 7, LW - X(0.06), 2, rail); mid.rect(X(0.06), G - 3, LW - X(0.06), 1, rail); });
      for (let x = X(0.08); x < LW; x += 11) mid.grp(() => { mid.rect(Math.round(x), G - 9, 2, 10, post); });
      lampPost(mid, Math.round(X(0.36)), G + 1, 28, { r: 32, dir: 1 }); lampPost(mid, Math.round(X(0.8)), G + 1, 32, { r: 32, dir: -1 });
      const pole = mat('#5E4430'); mid.rect(Math.round(X(0.62)), Math.round(Ha * 0.36), 1, G - Math.round(Ha * 0.36) + 1, pole);
      rope(mid, X(0.07), Math.round(Ha * 0.32), X(0.62), Math.round(Ha * 0.37), 8, 4, { r: 16, rgb: [255, 170, 110], a: 0.4 });
      const hay = mat('#C8A858', 'vol', { wide: 1 }), hayL = flat('#8A7038', { nl: 0 });
      for (const [fx, rr] of [[0.93, 6], [0.985, 5]]) { const x = Math.round(X(fx)); mid.oval(x, G - rr + 1, rr, rr, hay); mid.oval(x, G - rr + 1, rr * 0.5, rr * 0.5, hayL); }
      // tall flowers along the fence
      const fc = ['#C8A0E0', '#E8B070', '#F2E6A0', '#E07A8A'].map(h => flat(h, { nl: 0 })), stem = flat('#3E6A3A', { nl: 0 });
      for (let x = X(0.1) + r() * 4; x < X(0.9); x += 4 + r() * 6) { const h = 5 + Math.round(r() * 6), c = fc[Math.floor(r() * 4)]; mid.rect(Math.round(x), G - h, 1, h, stem); mid.rect(Math.round(x), G - h - 2, 1, 2, c); if (r() < 0.5) mid.px(Math.round(x) + 1, G - h - 1, c); }
      for (const [fx, rx] of [[0.2, 5], [0.52, 4], [0.7, 6]]) mid.oval(X(fx), G, rx, rx * 0.55, leaf2, 'top');
    } else {
      // standing stones with runes, crystal clusters at their feet, warm lamps on the path
      const stone = mat(desat(C(th.stone), 0.7), 'vol'), rune = C('#9BE3F0'), runeM = tinted(rune);
      const standing = (x, sw, sh, lit) => { x = Math.round(x); mid.grp(() => { mid.rect(x - (sw >> 1), G - sh + 1, sw, sh, stone); mid.oval(x - 0.5, G - sh + 1, sw / 2, 1.5, stone, 'top'); }); if (lit) { const ry = G - Math.round(sh * 0.6); mid.px(x - 1, ry, runeM); mid.px(x, ry + 1, runeM); mid.px(x - 1, ry + 3, runeM); light(mid, x, ry + 1, 14, { rgb: rune, a: 0.3, core: 0, flick: 0, kind: 'rune' }); } };
      standing(X(0.17), 5, 22, 1); standing(X(0.23), 4, 12, 0); standing(X(0.86), 6, 26, 1); standing(X(0.97), 5, 18, 0);
      const cluster = (x, n, lit) => { x = Math.round(x); for (let k = 0; k < n; k++) mid.tri(x + k * 2 - n, G - (4 + (k * 5) % 6), 4 + (k * 5) % 6, 1, k % 2 ? cryM : cryD); if (lit) light(mid, x, G - 4, 26, { rgb: cry, a: 0.4, core: 0.5, flick: 0, kind: 'crystal', gnd: 10 }); };
      cluster(X(0.2), 4, 1); cluster(X(0.9), 5, 1); cluster(X(0.52), 3, 0);
      lampPost(mid, Math.round(X(0.4)), G + 1, 28, { r: 32, dir: 1 }); lampPost(mid, Math.round(X(0.72)), G + 1, 24, { top: 1, r: 28 });
      for (const [fx, rx] of [[0.3, 5], [0.62, 4]]) mid.oval(X(fx), G, rx, rx * 0.55, leaf2, 'top');
    }
    // -- ground: grass, a footpath, flowers or crystal glints, the basket or crate (drawn live) --
    gnd.grp(() => { for (let x = 0; x < LW; x++) for (let y = pathTop + ((x * 5 + 1) % 9 < 2 ? 1 : 0); y < pathBot - ((x * 3) % 11 < 3 ? 1 : 0); y++) gnd.span(x, x + 1, y, pathM, gnd.pc); });
    const dots = glade ? [flat(blend(cry, C(th.gnd), 0.3)), flat(blend(C('#DCE8FF'), C(th.gnd), 0.4))] : ['#E8B070', '#C8A0E0', '#F2E6A0', '#E07A8A', '#FFFFFF'].map(h => flat(h));
    for (let i = 0; i < LW / 4; i++) gnd.px(r() * LW, pathBot + 2 + r() * (Ha - pathBot - 3), dots[i % dots.length]);
    const pebble = flat(ramp(desat(C(th.stone || '#6A6878'), 0.6))[1]), pebD = flat(ramp(desat(C(th.stone || '#6A6878'), 0.6))[3]);
    for (let i = 0; i < LW / 14; i++) { const x = r() * LW, y = pathTop + 2 + r() * (pathBot - pathTop - 3); gnd.rect(x, y, 2, 1, pebble); gnd.rect(x, y + 1, 2, 1, pebD); }
    if (glade) for (const fx of [0.33, 0.64]) { const x = Math.round(X(fx)), y = pathBot + 6 + Math.round(r() * 5); gnd.tri(x, y - 4, 4, 1, cryD); gnd.tri(x + 2, y - 3, 3, 1, cryM); }
    const px = Math.round(X(0.15)), pb = pathBot + 10;
    A.out.pile = { kind: glade ? 'crate' : 'basket', x: (px + 0.5) * PX - M, y: pb * PX };
  }
  function fgMeadow(A, glade) {
    const { th, C, X, Ha, fg, flat, tinted, desat, blend, light, fgId, fgT, tuft } = A;
    fg.oval(X(-0.02), Ha + 1, 10, 6, fgId, 'top'); tuft(X(-0.01), 6, 12); tuft(X(0.92), 6, 10); tuft(X(0.55), 2, 4);
    if (glade) { const cry = C(th.crystal), x = Math.round(X(0.985)); fg.tri(x, Ha - 12, 12, 2, tinted(blend(cry, [6, 4, 10], 0.35))); fg.tri(x - 4, Ha - 7, 7, 1.5, tinted(blend(cry, [6, 4, 10], 0.5))); light(fg, x, Ha - 6, 22, { rgb: cry, a: 0.35, core: 0.3, flick: 0, kind: 'crystal', pool: 0.2 }); }
    else { const fc = ['#E8B070', '#C8A0E0', '#F2E6A0'].map(h => flat(blend(C(h), [6, 4, 10], 0.3))); for (let k = 0; k < 5; k++) { const x = Math.round(X(0.9) + k * 2.2), y = Ha - 6 - (k % 3) * 3; fg.rect(x, y, 1, Ha - y, fgT); fg.rect(x - 1, y - 1, 2, 2, fc[k % 3]); } }
  }

  registerSceneTheme('gmine', {
    th: { sky: ['#07060B', '#0E0C14', '#16121D', '#1E1926'], far: '#231E2C', far2: '#2B2534', rock: '#3C3547', rock2: '#4A4254', wood: '#6E4C2E', iron: '#34303C',
      gnd: '#1E1A26', lip: '#4A4254', path: '#2C2632', amb: ['drip', '#9FC4E8', 9], amb2: ['dust', '#C9B89A', 14], fog: ['#8A7A6A', 0.06] },
    paint: paintMine, fg: fgMine, tint: ['10,8,14', 0.2, 0]
  });
  registerSceneTheme('gwoods', {
    th: { sky: ['#0E1C18', '#18301F', '#27462C', '#3A5E3A'], far: '#20382A', far2: '#27422F', leaf: '#2E5E36', leaf2: '#27502F', bark: '#553E2C', iron: '#3A3444',
      gnd: '#26482A', lip: '#4F8A42', path: '#5A4630', amb: ['leaf', '#7FBE5E', 10], amb2: ['firefly', '#D8F07A', 10], fog: ['#CFE8B0', 0.06] },
    paint: paintWoods, fg: fgWoods, grassy: 1
  });
  registerSceneTheme('gmeadow', {
    th: { sky: ['#161A34', '#2E2E52', '#5E4A6C', '#A26E6A'], far: '#3A4058', far2: '#3C4A4E', leaf: '#3E6A3E', leaf2: '#355E38', bark: '#5A4432', stone: '#6A6878', iron: '#3A3444',
      gnd: '#2E5230', lip: '#5E9A48', path: '#6A5A3A', stars: 1, moon: '#F4E6C8', amb: ['firefly', '#E8F07A', 12], amb2: ['mote', '#FFE6A0', 8], fog: ['#E8C8B0', 0.06] },
    paint: A => paintMeadow(A, false), fg: A => fgMeadow(A, false), grassy: 1, tint: ['200,120,110', 0.06, 1]
  });
  registerSceneTheme('gglade', {
    th: { sky: ['#060A16', '#0C1426', '#15223A', '#203250'], far: '#1A2638', far2: '#1E2E40', leaf: '#2E4A48', leaf2: '#27403E', bark: '#4A4448', stone: '#5A6478', crystal: '#8FD8FF', iron: '#343444',
      gnd: '#1C3434', lip: '#3A6A5E', path: '#34464A', stars: 1, moon: '#DCE8FF', amb: ['mote', '#9FE3FF', 14], amb2: ['firefly', '#BDF0FF', 6], fog: ['#8FB8E0', 0.1] },
    paint: A => paintMeadow(A, true), fg: A => fgMeadow(A, true), grassy: 1, tint: ['40,70,140', 0.1, 1]
  });

  // =====================================================================================
  // Live nodes
  // =====================================================================================
  const FAM = { ore: 'rock', crystal: 'rock', wood: 'tree', fibre: 'plant', herb: 'plant' };
  const LIFE = 6;        // s of work a node lasts (it takes as many gathers as fit, 1-8)
  const REGROW = 8;      // s at least for a spent node to grow back (presentation only)
  const WALK = 80;       // the hero's walking speed, logical px per second
  const PILE_MAX = { cart: 6, logs: 15, basket: 6, crate: 6 };
  // Where the worked node can stand: the hero stands on its left with the tool's strike reaching
  // NODE_HIT of the way into the node's box (62-stage heroHome, G1; the same fractions), and the hero
  // must stay on the stage (its feet HERO_MIN px in). So the nodes the hero works fill the stage from
  // there to the right edge; smaller ones further off (not worked) make 3-5 in all.
  const NODE_HIT = { ore: 0.12, crystal: 0.12, wood: 0.4, fibre: 0.2, herb: 0.2 };
  const HERO_MIN = 26, REACH = 66;
  function heroReach() {
    try {
      const f = charFrames(TOOL_ART.gatherSpec(heroSpec(), toolFor(skillOf(gatherArtKind(G.kind)))));
      if (!f || !ART.ready(f, 'strike')) return 0;
      const q = f.strike, c = q.c, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      for (let x = c.width - 1; x >= 0; x--) for (let y = 0; y < c.height; y++) if (d[(y * c.width + x) * 4 + 3] > 40) return x + 1 - q.ox;
    } catch (e) {}
    return 0;
  }
  const G = { reach: 0, reachT: -9, key: '', kind: '', t: 1, fam: 'rock', fr: null, nodes: [], cur: 0, pile: 0, lastT: -1, SW: 0, GY: 0, lift: 0, walk: null, snap: true, stage: 0, cutX: 0 };
  const ease = q => q < 0 ? 0 : q > 1 ? 1 : q * q * (3 - 2 * q);
  const frames = () => enemyFrames('node:' + gatherArtKind(G.kind), { tier: G.t });

  let seenT = -1, seenSW = 0, seenGY = 0;
  function ensure(SW, GY) {
    if (T === seenT && SW === seenSW && GY === seenGY) return;   // called a few times a frame: once is enough
    seenT = T; seenSW = SW; seenGY = GY;
    const kind = S.node.kind, t = S.node.t;
    // the hero's real reach, once its strike frame is baked (until then an estimate)
    if (!G.reach && kind === G.kind && T > G.reachT + 1) { G.reachT = T; const r = heroReach(); if (r) { G.reach = r; G.key = ''; } }
    const cold = kind === 'wood' && t === 1 && typeof hearthScene === 'function' && !!hearthScene();   // the opening camp scene only
    const key = kind + t + '|' + SW + '|' + GY + '|' + cold;
    if (key === G.key) return;
    const again = G.kind === kind && G.t === t;
    if (!again) { G.reach = 0; G.reachT = -9; }
    G.key = key; G.kind = kind; G.t = t; G.fam = FAM[gatherArtKind(kind)] || 'tree'; G.fr = frames(); G.SW = SW; G.GY = GY; G.cold = cold;
    // the back lane stands a little behind the path's front edge (not in the air over the scenery)
    G.lift = Math.max(8, Math.min(12, Math.round(GY * 0.04)));
    const f = G.fr && G.fr.idle0, w = f ? f.c.width : 60, ox = f ? f.ox : 30, rx = w - ox;
    // at the cold Hearth (63d) the station plots take the stage's right edge: keep it clear
    // (and the hero stands clear of the fire and Hesketh, at the left)
    const xa = Math.round((cold ? Math.max(HERO_MIN, SW * 0.3) : HERO_MIN) + (G.reach || REACH) - w * (NODE_HIT[gatherArtKind(kind)] ?? 0.15) + ox), xb = Math.min(Math.round(SW * 0.9), cold ? SW - rx - 30 : Math.round(SW - rx * 0.75));
    const gap = Math.max(24, Math.round(w * 0.42)), nMax = SW < 270 ? 3 : SW < 400 ? 4 : 5;
    const nw = xb - xa < 10 ? 1 : Math.max(2, Math.min(nMax, Math.floor((xb - xa) / gap) + 1));   // two at least: the hero walks
    // Worked nodes: the front and back lanes in turn (the last in front). Then smaller ones further off
    // (the art at 1x, hazed: young trees, a low outcrop, a small patch), so 3-5 always show: first in the
    // open ground left of the worked row (behind the hero), then in the row's gaps. Never over the fire.
    const list = [];
    for (let i = 0; i < nw; i++) list.push({ x: nw > 1 ? Math.round(xa + (xb - xa) * i / (nw - 1)) : Math.max(xa, xb), lane: (nw - 1 - i) % 2 ? 0 : 1 });
    const nDeep = Math.max(1, (SW < 270 ? 4 : 5) - nw), spots = [], half = Math.round(w * 0.25), x0 = cold ? Math.round(SW * 0.36) + half : Math.round(half * 0.5);
    for (let x = x0; x <= xa - Math.round(gap * 1.1); x += Math.max(30, Math.round(w * 0.5))) spots.push(x);
    for (let i = 1; i < nw; i += 2) if (list[i].x - list[i - 1].x >= w * 0.5) spots.push(Math.round((list[i - 1].x + list[i].x) / 2));
    if (!spots.length) spots.push(Math.min(SW - half - 4, xb + Math.round(gap * 0.8)));
    for (let i = Math.min(nDeep, spots.length) - 1; i >= 0; i--) list.unshift({ x: spots[i], lane: 0, deco: true, deep: true });
    const nd = list.length - nw;
    const old = again && G.nodes.length === list.length ? G.nodes : null;
    G.nodes = list.map((q, i) => {
      const o = old && old[i];
      return Object.assign(q, { y: GY - (q.deep ? G.lift + 3 : q.lane ? 0 : G.lift), st: o ? o.st : 'full', g: o ? o.g : 0, hits: o ? o.hits : 0, rg: o ? o.rg : REGROW * 2, ph: i * 1.7 });
    });
    if (!old) {
      G.cur = nd; G.pile = again ? G.pile : 0; G.snap = !again;
      // a node already growing back: the place has been worked before
      if (nw >= 3) { const k = G.nodes.length - 1; G.nodes[k].st = 'gone'; G.nodes[k].g = 0.45; }
      else if (nd >= 2) { G.nodes[0].st = 'gone'; G.nodes[0].g = 0.55; }
    }
    G.stage = 0;
  }
  on('sceneReset', () => { seenT = -1; G.key = ''; G.kind = ''; G.walk = null; G.snap = true; });

  gatherRight = x => { let r = x; const f = G.fr && G.fr.idle0; if (f) for (const nd of G.nodes) if (!nd.deep) r = Math.max(r, nd.x + f.c.width - f.ox); return r; };
  gatherSpot = (SW, GY) => { ensure(SW, GY); const nd = G.nodes[G.cur]; return nd || { x: Math.round(SW * 0.68), y: GY }; };

  // The hero walks from node to node (snaps under reduced motion or when the scene changes).
  const walkAt = w => w.dur <= 0 || T >= w.t0 + w.dur ? w.to : w.from + (w.to - w.from) * ease((T - w.t0) / w.dur);
  gatherHeroX = x => {
    const w = G.walk;
    if (!w || G.snap || REDUCED) { G.walk = { from: x, to: x, t0: T, dur: 0 }; G.snap = false; return x; }
    if (x !== w.to) {
      const at = walkAt(w), d = Math.abs(x - at);
      if (d < 3) { w.to = x; w.dur = 0; return x; }       // a frame or two of a different width, not a walk
      w.from = at; w.to = x; w.t0 = T; w.dur = d / WALK;
    }
    return Math.round(walkAt(w));
  };
  gatherWalking = () => !!G.walk && G.walk.dur > 0 && T < G.walk.t0 + G.walk.dur;

  // A finished gather: the worked node is spent, the next full one (to the right, then from the left)
  // becomes the worked node. With none full, the one nearest to grown back is ready early.
  // How many gathers a node takes: about LIFE s of work at the current speed.
  const unitT = () => { try { return Math.max(0.3, nodeTime(G.kind, G.t)); } catch (e) { return 3; } };
  let capT = -9, capV = 1;
  const capOf = () => { if (T > capT + 0.5 || T < capT) { capT = T; capV = Math.max(1, Math.min(8, Math.round(LIFE / unitT()))); } return capV; };
  function deplete() {
    const N = G.nodes, n = N.length; if (!n) return;
    const nd = N[G.cur], cap = capOf();
    G.pile = Math.min(PILE_MAX[pileKind()] || 6, G.pile + 1);
    if (++nd.hits < cap) { chipFx(nd); return; }
    nd.st = 'gone'; nd.g = 0; nd.hits = 0;
    // grows back in about half the time the other nodes take to work through
    nd.rg = Math.max(REGROW, Math.min(30, (n - 1) * cap * unitT() * 0.5));
    spentFx(nd);
    let next = -1;
    for (let k = 1; k < n && next < 0; k++) { const j = (G.cur + k) % n; if (N[j].st === 'full' && !N[j].deco) next = j; }
    if (next < 0) { let best = -1; for (let j = 0; j < n; j++) if (j !== G.cur && !N[j].deco && (best < 0 || N[j].g > N[best].g)) best = j; next = best < 0 ? G.cur : best; N[next].st = 'full'; N[next].g = 0; N[next].hits = 0; }
    G.cur = next; G.stage = 0;
  }
  on('harvest', p => { if (!p || p.away || p.glint || target() !== 'node' || !G.nodes.length || p.kind !== G.kind) return; deplete(); });
  const pileKind = () => ({ ore: 'cart', crystal: 'crate', wood: 'logs' })[G.kind] || 'basket';

  // a gather that leaves the node standing: a few chips
  function chipFx(nd) {
    if (typeof ANIM === 'undefined') return;
    const f = G.fr && G.fr.idle0; if (!f) return;
    ANIM.burstPx(nd.x - 6, nd.y - f.oy * 0.45, G.fam === 'tree' ? '#E8C890' : G.fam === 'plant' ? '#9FD878' : nodeColor(), 5, 55);
  }
  function spentFx(nd) {
    if (typeof ANIM === 'undefined') return;
    const f = G.fr && G.fr.idle0, h = f ? f.oy : 30, col = nodeColor();
    const x = nd.x, y = nd.y - h * 0.4;
    if (G.fam === 'rock') { ANIM.burstPx(x, y, col, 10, 70); ANIM.burstPx(x, nd.y - 4, '#8A8494', 8, 40); }
    else if (G.fam === 'tree') { ANIM.burstPx(x, nd.y - h * 0.7, '#6FBE5E', 10, 50, 40); ANIM.burstPx(x, nd.y - 8, '#D8B47A', 8, 60); }
    else ANIM.burstPx(x, nd.y - h * 0.5, col, 10, 45, 60);
  }

  // ---------------- sprites made from the node's own frames ----------------
  const artData = new WeakMap();
  function pixelsOf(f) {
    let d = artData.get(f.art);
    if (!d) { try { d = f.art.getContext('2d').getImageData(0, 0, f.art.width, f.art.height); } catch (e) { d = null; } artData.set(f.art, d); }
    return d;
  }
  const up2 = src => { const c = document.createElement('canvas'); c.width = src.width * 2; c.height = src.height * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, c.width, c.height); return c; };
  const INK = [18, 11, 24];
  // The spent node, made from the node's own sprite: a rock broken low and grey (an empty vein), a
  // stump with its cut face and rings, or stubble on the bed's soil. Ink on every new edge. Cached per set.
  const spentSets = new WeakMap();
  function spentOf(fr) {
    let sp = spentSets.get(fr); if (sp !== undefined) return sp;
    sp = null;
    const f = fr.idle0, img = f && f.art && pixelsOf(f);
    if (img) {
      const w = img.width, h = img.height, d = img.data, oy = Math.min(h - 1, Math.round(f.artOy)), ox = Math.round(f.artOx), fam = G.fam;
      const A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
      let top = h; for (let y = 0; y < h && top === h; y++) for (let x = 0; x < w; x++) if (A(x, y)) { top = y; break; }
      const tall = Math.max(4, oy - top), c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'), out = g.createImageData(w, h), o = out.data;
      const put = (x, y, rgb) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; o[i] = rgb[0]; o[i + 1] = rgb[1]; o[i + 2] = rgb[2]; o[i + 3] = 255; };
      const copy = (x, y) => { const i = (y * w + x) * 4; o[i] = d[i]; o[i + 1] = d[i + 1]; o[i + 2] = d[i + 2]; o[i + 3] = 255; };
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      if (fam === 'rock') {
        const cut = oy - Math.round(tall * 0.42);
        for (let x = 0; x < w; x++) {
          const cx = cut + (rnd() < 0.45 ? 1 : 0) + (rnd() < 0.2 ? 1 : 0);
          let first = true;
          for (let y = cx; y < h; y++) {
            if (!A(x, y)) continue;
            const i = (y * w + x) * 4, ink = d[i] + d[i + 1] + d[i + 2] < 70;
            if (ink) { copy(x, y); first = false; continue; }
            const l = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) * 0.72, e = first ? 30 : 0;
            put(x, y, [l + 8 + e, l + 6 + e, l + 16 + e]);
            if (first) put(x, y - 1, INK);
            first = false;
          }
        }
      } else if (fam === 'tree') {
        const cut = oy - Math.max(5, Math.round(tall * 0.2));
        for (let y = cut; y < h; y++) for (let x = 0; x < w; x++) if (A(x, y)) copy(x, y);
        // the trunk on the cut row, then a cap: the cut face seen a little from above
        let x0 = ox; for (let k = 0; k < 6 && !A(x0, cut); k++) x0 += k % 2 ? k : -k;
        let xl = x0, xr = x0; while (A(xl - 1, cut)) xl--; while (A(xr + 1, cut)) xr++;
        for (let x = xl; x <= xr; x++) put(x, cut, [200, 160, 112]);
        for (let x = xl + 1; x < xr; x++) { put(x, cut - 1, (x - xl) % 3 === 2 ? [176, 138, 90] : [226, 192, 138]); put(x, cut - 2, INK); }
        put(xl, cut - 1, INK); put(xr, cut - 1, INK); put(xl, cut, INK); put(xr, cut, INK);
      } else {
        // the bed's soil and leaf bases, and short stalks cut to stubble
        const base = oy - 3;
        let xl = w, xr = 0;
        for (let y = base; y < h; y++) for (let x = 0; x < w; x++) if (A(x, y)) { copy(x, y); xl = Math.min(xl, x); xr = Math.max(xr, x); }
        for (let x = xl + 2; x < xr - 1; x += 2 + (rnd() < 0.3 ? 1 : 0)) {
          const hh = 2 + (rnd() < 0.4 ? 1 : 0);
          for (let k = 0; k < hh; k++) put(x, base - 1 - k, k === hh - 1 ? [216, 206, 140] : [78, 106, 58]);
          put(x, base - 1 - hh, INK);
        }
      }
      g.putImageData(out, 0, 0);
      sp = { c: up2(c), ox: f.ox, oy: f.oy, art: c, artOx: f.artOx, artOy: f.artOy };
    }
    spentSets.set(fr, sp);
    return sp;
  }
  // Cracks (rock), a notch (tree) or cuts (plants) on a frame, as art px [x, y, colour] in the order
  // they appear. Cached per frame.
  const crackSets = new WeakMap();
  function cracksOf(f) {
    let cr = crackSets.get(f.art); if (cr) return cr;
    cr = [];
    const img = pixelsOf(f);
    if (img) {
      const w = img.width, h = img.height, d = img.data, A = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
      const inside = (x, y) => A(x, y) && A(x - 1, y) && A(x + 1, y) && A(x, y - 1) && A(x, y + 1);
      const oy = Math.round(f.artOy), ox = Math.round(f.artOx);
      let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      if (G.fam === 'rock') {
        let top = h, left = w, right = 0;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (A(x, y)) { top = Math.min(top, y); left = Math.min(left, x); right = Math.max(right, x); }
        const len = Math.max(5, Math.round((oy - top) * 0.55));
        for (const fr of [0.45, 0.68, 0.26, 0.56]) {
          let x = Math.round(left + (right - left) * fr), y = top;
          while (y < oy && !inside(x, y)) y++;
          for (let k = 0; k < len && inside(x, y); k++) {
            cr.push([x, y, 0]); if (inside(x + 1, y)) cr.push([x + 1, y, 1]);
            y++; const s = rnd(); x += s < 0.3 ? -1 : s > 0.72 ? 1 : 0;
            if (!inside(x, y)) x -= Math.sign(x - ox) || 1;
          }
        }
      } else if (G.fam === 'tree') {
        // a notch cut into the trunk's left side, deeper as the gather builds
        const y0 = oy - 5;
        let xl = ox; while (xl > 0 && A(xl - 1, y0)) xl--;
        let xr = ox; while (xr < w - 1 && A(xr + 1, y0)) xr++;
        const maxD = Math.max(1, Math.min(4, Math.floor((xr - xl) * 0.6)));
        for (let dpt = 1; dpt <= maxD; dpt++) for (const [dy, k] of [[0, 1], [1, 0.5], [-1, 0.5], [2, 0.2], [-2, 0.2]]) {
          const reach = Math.round(dpt * k + (k === 1 ? 0 : 0.4)); if (reach < 1) continue;
          const x = xl + reach - 1, y = y0 + dy;
          if (A(x, y) && !cr.some(p => p[0] === x && p[1] === y)) cr.push([x, y, dy === 0 ? 2 : 3]);
        }
      } else {
        // sickle cuts: pale slashes across the base, left to right
        const yb = oy - 1;
        let left = w, right = 0; for (let x = 0; x < w; x++) for (let y = yb - 6; y <= yb; y++) if (A(x, y)) { left = Math.min(left, x); right = Math.max(right, x); }
        for (let x0 = left + 1; x0 < right; x0 += 4) for (let k = 0; k < 4; k++) { const x = x0 + k, y = yb - 1 - k; if (A(x, y)) cr.push([x, y, 4]); }
      }
    }
    crackSets.set(f.art, cr);
    return cr;
  }
  const CRACK = ['#120B18', 'rgba(230,224,240,0.35)', '#E8C890', '#B08A58', '#E8E0A0'];

  // back-lane copies, a little darker (the stage's own upper lane look)
  const dimmed = new WeakMap();
  function dimOf(c) {
    let d = dimmed.get(c);
    if (!d) { d = document.createElement('canvas'); d.width = c.width; d.height = c.height; const g = d.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(14,9,24,0.3)'; g.fillRect(0, 0, d.width, d.height); dimmed.set(c, d); }
    return d;
  }
  // the far-off nodes: the 1x art, darker and hazed
  const deeped = new WeakMap();
  function deepOf(c) {
    let d = deeped.get(c);
    if (!d) { d = document.createElement('canvas'); d.width = c.width; d.height = c.height; const g = d.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(16,12,28,0.42)'; g.fillRect(0, 0, d.width, d.height); deeped.set(c, d); }
    return d;
  }

  // ---------------- piles: the cart's load, the woodpile, the basket, the crate ----------------
  const pileCache = new Map();
  function pileSprite(kind, n) {
    const col = kind === 'logs' ? craftTierCol('wood', G.t) : nodeColor(), key = kind + '|' + n + '|' + col;
    let c = pileCache.get(key); if (c) return c;
    const W = kind === 'logs' ? 32 : 30, H = 22, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const P = (x, y, hex) => { g.fillStyle = hex; g.fillRect(x, y, 1, 1); };
    const shade = (hex, k) => { const v = parseInt(hex.slice(1), 16), f = c2 => Math.max(0, Math.min(255, Math.round(c2 * k))); return `rgb(${f(v >> 16 & 255)},${f(v >> 8 & 255)},${f(v & 255)})`; };
    const lit = shade(col, 1.25), dk = shade(col, 0.62), ink = '#120B18', cx = W >> 1;
    if (kind === 'logs') {
      // log ends stacked in rows of 5, 4, 3, 2, 1 between the stakes
      const ringL = '#E2C08A', ringD = '#B08A58';
      for (const sx of [cx - 13, cx + 12]) for (let y = H - 18; y < H; y++) { P(sx - 1, y, ink); P(sx, y, y === H - 18 ? ink : '#7A5A3A'); P(sx + 1, y, y === H - 18 ? ink : '#5A4030'); P(sx + 2, y, ink); }
      let k = 0;
      for (let row = 0; row < 5 && k < n; row++) for (let i = 0; i < 5 - row && k < n; i++, k++) {
        const x = cx - 12 + i * 5 + row * 2.5, y = H - 5 - row * 4;
        const X = Math.round(x), Y = Math.round(y);
        for (const [dx, dy] of [[1, 0], [2, 0], [3, 0], [0, 1], [4, 1], [0, 2], [4, 2], [0, 3], [4, 3], [1, 4], [2, 4], [3, 4]]) P(X + dx, Y + dy, ink);
        for (const [dx, dy] of [[1, 1], [3, 1], [1, 3], [3, 3]]) P(X + dx, Y + dy, dk);
        P(X + 2, Y + 1, ringL); P(X + 1, Y + 2, ringL); P(X + 3, Y + 2, ringL); P(X + 2, Y + 3, ringD); P(X + 2, Y + 2, ringD);
      }
    } else if (kind === 'crate') {
      // shards standing in an open crate (the crate itself drawn here too)
      const wd = '#6A4C34', wdL = '#8A6A48', wdD = '#4A3424';
      for (let s = 0; s < Math.min(n, 6); s++) { const x = cx - 7 + s * 3 - (s % 2), hgt = 3 + (s * 5) % 4 + Math.min(3, n >> 1); for (let y = 0; y < hgt; y++) { P(x, H - 10 - y, y === hgt - 1 ? lit : col); if (y < hgt - 2) P(x + 1, H - 10 - y, dk); } P(x, H - 10 - hgt, ink); }
      for (let y = H - 10; y < H; y++) for (let x = cx - 9; x <= cx + 9; x++) P(x, y, x === cx - 9 || x === cx + 9 || y === H - 1 ? ink : y === H - 10 ? wdL : (y - H) % 4 === 0 ? wdD : wd);
      for (let x = cx - 9; x <= cx + 9; x++) P(x, H - 11, ink);
    } else {
      // a load (a heap of the material): rises above the rim; basket: a wicker basket under it
      const rimY = kind === 'cart' ? 10 : H - 9, hw = 8;
      if (n > 0) {
        const hgt = Math.min(7, 1 + n);
        for (let x = -hw; x <= hw; x++) {
          const top = Math.round(rimY - hgt * Math.sqrt(Math.max(0, 1 - (x / (hw + 0.5)) ** 2)));
          if (top >= rimY) continue;
          P(cx + x, top - 1, ink);
          for (let y = top; y < rimY; y++) P(cx + x, y, y === top ? lit : ((x * 7 + y * 3) % 5 === 0 ? dk : col));
        }
      }
      if (kind === 'basket') {
        const wk = '#A8845A', wkD = '#7A5A3A';
        for (let y = rimY; y < H; y++) { const inset = Math.round((y - rimY) * 0.3); for (let x = cx - 10 + inset; x <= cx + 10 - inset; x++) P(x, y, x === cx - 10 + inset || x === cx + 10 - inset || y === H - 1 ? ink : y === rimY ? '#C8A470' : (x + y) % 3 === 0 ? wkD : wk); }
        for (let x = cx - 10; x <= cx + 10; x++) P(x, rimY - (n ? 0 : 1), n ? ink : ink);
      }
    }
    c = up2(cv); c.ox = W; c.oy = kind === 'cart' ? 20 : H * 2;   // logical px: centre x, and the y that sits on the base (the rim for a cart)
    pileCache.set(key, c);
    if (pileCache.size > 24) pileCache.delete(pileCache.keys().next().value);
    return c;
  }

  // ---------------- per frame ----------------
  function step() {
    const dt = G.lastT < 0 ? 0 : Math.max(0, Math.min(0.1, T - G.lastT)); G.lastT = T;
    if (!dt) return;
    for (let i = 0; i < G.nodes.length; i++) {
      const nd = G.nodes[i]; if (nd.st === 'full' || i === G.cur) continue;
      nd.g += dt / (nd.rg || REGROW);
      if (nd.g >= 1) { nd.st = 'full'; nd.g = 0; const f = G.fr && G.fr.idle0; if (typeof ANIM !== 'undefined') ANIM.burstPx(nd.x, nd.y - (f ? f.oy * 0.6 : 20), '#F2E6A0', 6, 30, 20); }
    }
    // chips fly as the worked node's cracks grow
    const st = Math.floor(lifeProg() * 5);
    if (st > G.stage && typeof ANIM !== 'undefined') { const nd = G.nodes[G.cur], f = G.fr && G.fr.idle0; if (nd && f) ANIM.burstPx(nd.x - 6, nd.y - f.oy * 0.45, G.fam === 'tree' ? '#E8C890' : G.fam === 'plant' ? '#9FD878' : nodeColor(), 3, 40); }
    G.stage = st;
  }
  // the worked node's wear over its life: its gathers done plus the one under way
  function lifeProg() { const nd = G.nodes[G.cur]; return nd ? Math.min(0.999, (nd.hits + Math.min(1, S.gProg)) / capOf()) : 0; }
  function frameOf(nd) {
    const fr = G.fr; if (!fr) return null;
    return !REDUCED && ((T * 1.3 + nd.ph) % 2) >= 1 && ART.ready(fr, 'idle1') ? fr.idle1 : fr.idle0;
  }
  // a node's image: its frame (the worked row; the back lane dimmed) or the 1x art, hazed (further off)
  const img = (nd, f) => nd.deep ? { c: deepOf(f.art), ox: f.artOx, oy: f.artOy } : { c: nd.lane === 0 ? dimOf(f.c) : f.c, ox: f.ox, oy: f.oy };
  function drawNode(ctx, nd, cam) {
    const fr = G.fr; if (!fr) return;
    const x = nd.x - cam, y = nd.y;
    const put = (m, a) => { if (a !== undefined) ctx.globalAlpha = a; ctx.drawImage(m.c, Math.round(x - m.ox), Math.round(y - m.oy)); ctx.globalAlpha = 1; };
    if (nd.st === 'full') { put(img(nd, frameOf(nd))); return; }
    const sp = spentOf(fr), f = fr.idle0, g = nd.g;
    if (G.fam === 'rock') {
      if (sp) put(img(nd, sp));
      // the vein fills back in
      const a = REDUCED ? (g > 0.66 ? 0.66 : g > 0.33 ? 0.33 : 0) : Math.pow(Math.max(0, (g - 0.3) / 0.7), 1.4);
      if (a > 0.02) put(img(nd, f), a);
      return;
    }
    // trees and plants grow from the stump or stubble
    const q = REDUCED ? Math.floor(g * 3) / 3 : g, s = Math.round((0.2 + 0.8 * ease((q - 0.12) / 0.88)) * 16) / 16;
    if (sp && (q < 0.55 || G.fam === 'plant')) put(img(nd, sp));
    if (q > 0.12) { const m = img(nd, f); ctx.drawImage(m.c, Math.round(x - m.ox * s), Math.round(y - m.oy * s), Math.round(m.c.width * s), Math.round(m.c.height * s)); }
  }
  function shadow(ctx, x, y, w, a) {
    ctx.globalAlpha = a; ctx.drawImage(ANIM.glow('0,0,0'), x - w, y - 3, w * 2, 7); ctx.globalAlpha = 1;
  }
  gatherDraw = function (ctx, scene, cam, part, s) {
    if (target() !== 'node' || !G.nodes.length || !G.fr) return;
    const N = G.nodes, cur = N[G.cur], f0 = G.fr.idle0;
    const smooth = ctx.imageSmoothingEnabled;
    if (part === 'back') {
      step();
      // shadows under the other nodes
      ctx.imageSmoothingEnabled = true;
      for (const nd of N) if (nd !== cur) shadow(ctx, nd.x - cam, nd.y, Math.max(12, f0.c.width * 0.36) * (nd.st === 'full' ? 1 : 0.7) * (nd.deep ? 0.5 : 1), nd.lane ? 0.5 : nd.deep ? 0.3 : 0.35);
      ctx.imageSmoothingEnabled = false;
      for (const nd of N) if (nd !== cur && (nd.lane === 0 || cur.lane === 1)) drawNode(ctx, nd, cam);
      ctx.imageSmoothingEnabled = smooth;
      return;
    }
    // front: nodes nearer than the worked one, then its cracks, then the Glint and the node lights
    ctx.imageSmoothingEnabled = false;
    if (cur.lane === 0) for (const nd of N) if (nd !== cur && nd.lane === 1) drawNode(ctx, nd, cam);
    // the load: cart, woodpile, basket or crate, in the floor band (the ground layer: parallax 1)
    const pl = scene && scene.ext && scene.ext.pile;
    if (pl) {
      const kind = pl.kind, spr = pileSprite(kind, G.pile + (kind === 'logs' ? 2 : 0));
      const x = G.cold ? G.SW - 58 : pl.x, y = G.cold ? pl.y + 10 : pl.y;
      ctx.drawImage(spr, Math.round(x - cam - spr.ox), Math.round(y - spr.oy));
    }
    const f = s && s.dF;
    const lp = lifeProg();
    if (f && f.art && lp > 0.05) {
      const cr = cracksOf(f), n = Math.round(cr.length * Math.floor(lp * 5) / 4);
      for (let i = 0; i < Math.min(n, cr.length); i++) { const p = cr[i]; ctx.fillStyle = CRACK[p[2]]; ctx.fillRect(s.dX + p[0] * 2, s.dY + p[1] * 2, 2, 2); }
    }
    ctx.imageSmoothingEnabled = true;
    ctx.globalCompositeOperation = 'lighter';
    const gl = typeof glint === 'function' ? glint() : null;
    if (gl && gl.on && f) {
      // the rich vein: a warm glow that breathes, and stars twinkling around the node
      const cx = s.dX + f.ox, cy = s.dY + f.oy * 0.5, p = REDUCED ? 0.8 : 0.65 + 0.35 * Math.sin(T * 7);
      ANIM.lightAt(ctx, '255,214,120', cx, cy, Math.max(f.c.width, f.oy) * 0.8, 0.4 * p);
      ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = false;
      for (let k = 0; k < 3; k++) {
        const ph = REDUCED ? k / 3 : (T * 0.9 + k / 3) % 1, a = REDUCED ? 1 : Math.sin(ph * Math.PI);
        if (a < 0.15) continue;
        const sx = Math.round(cx + Math.cos(k * 2.1 + 0.6) * f.c.width * 0.32), sy = Math.round(cy + Math.sin(k * 2.1 + 0.6) * f.oy * 0.4);
        ctx.globalAlpha = a; ctx.fillStyle = '#FFF3C4';
        ctx.fillRect(sx - 1, sy - 3, 2, 6); ctx.fillRect(sx - 3, sy - 1, 6, 2); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx - 1, sy - 1, 2, 2);
      }
      ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true; ctx.globalCompositeOperation = 'lighter';
    }
    // the other full nodes' own lights (tier glows), two each at most, softer at the back
    for (const nd of N) {
      if (nd === cur || nd.st !== 'full' || nd.deep) continue;
      const L = f0.lights; if (!L || !L.length) continue;
      const x0 = nd.x - cam - f0.ox, y0 = nd.y - f0.oy;
      for (let i = 0; i < 1; i++) { const l = L[i]; ANIM.lightAt(ctx, l.rgb, x0 + l.x, y0 + l.y, Math.min(Math.max(8, l.size * 3), 20) * 1.3, nd.lane ? 0.26 : 0.18); }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = smooth;
  };

  // ---------------- warm-up: build a gathering scene in idle time before it is needed ----------------
  // Picking a node switches to it at once, so the scenes are built ahead, in small idle steps: the last
  // node's scene a few seconds after boot, every gathering scene when the Gather menu opens, a newly
  // picked kind's while fighting. The scene only: its device-size plates build after the switch, so
  // the two plate slots keep the zone on screen and the next zone's.
  const warmed = new Set(), warmQueue = [];
  let warming = false;
  // C12: sceneSteps keeps only three unfinished scenes. Four gathering themes running
  // round-robin evict one another forever, so finish one before starting the next.
  // Still yield after every build step; other idle work keeps its turn.
  function warmStep() {
    if (warmQueue[0]()) warmQueue.shift();
    if (warmQueue.length) idleTask(warmStep);
    else warming = false;
  }
  function warm(kind) {
    if (!gatherTheme(kind)) return; // C24: no hunting scene of its own yet (it borrows the woods while HUNT_TUNE.borrowArt)
    if (typeof stageStats !== 'function' || typeof sceneSteps !== 'function' || typeof idleTask !== 'function') return;
    const st = stageStats(); if (!st || !st.SW) return;
    const SCH = st.SH >= 210 ? st.SH : Math.round(st.GY / 0.8), th = gatherTheme(kind), key = th + '|' + st.SW + 'x' + SCH;
    if (warmed.has(key)) return;
    warmed.add(key);
    warmQueue.push(sceneSteps(th, st.SW, SCH, 0));
    if (!warming) { warming = true; idleTask(warmStep); }
  }
  on('menuView', p => { if (p && p.tab === 'gat') { warm(S.node.kind); for (const k of GATHER_KINDS) warm(k); } });
  on('sceneReset', () => { if (S.activity !== 'gather') warm(S.node.kind); });
  if (typeof setTimeout === 'function') setTimeout(() => warm(S.node.kind), 3000);
}
