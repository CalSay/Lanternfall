// 12g-art-accessories: the achievement looks drawn on the hero (docs/design/achievements.md 4.3, task AC4).
// DATA and pure maths only: no DOM (loads in Node). B1 rules: docs/design/art-direction.md.
//
// Capes, hats and lantern skins are kit pieces added to the hero after the class build
// (AK.applyAcc(k, acc), called by 60b-baker's buildParts), so they get the baker's 3 tones, section
// lines and ink outline, and bake once per wear change (the acc joins the spec hash). Flames tint
// the lantern glass. Auras and portrait frames are data here; 64-looks.js draws them.
//
//   acc = { cape, hat, lamp, fl: '#hex' }   (lookAcc(wear?) builds it from wearGet or a wear map;
//                                            a hat is left out while Show helm is on)
//   Cape: z 0.3 bone up, from the shoulders to the calf; replaces pieces tagged acc: 'back'.
//         A collar over the back shoulder (z 3.72) and a clasp at the throat (z 3.95).
//         Hem swings 1 art px on the bob and strike frames.
//   Hat:  z 4.55 bone head, at most 5 art px above k.top; the baker drops the helm (g.head = null).
//   Lamp: replaces the pieces tagged acc: 'lamp'/'glass' where k.lamp says the lantern hangs
//         (hip or held); a class with no lantern (Lightkeeper) gets one at the hip.
//   Flame: the glass colour (pieces tagged 'glass' or 'flame') and, in 62-stage, the hero's light.
//
// Exposed: LOOK_ART { CAPES, HATS, LAMPS, FLAMES, AURAS, FRAMES, CIRCLE_COL, lampItems(id, s, glass),
//   auraPx(id, f, o), flameCol(id), ids() }, lookAcc(wear?), lookFlameCol(id), AK.applyAcc(k, acc).
// Every piece carries o.look = 1 (64-looks renders the pieces alone for tile icons).

let lookAcc, lookFlameCol;
const LOOK_ART = (() => {
  const { m, mix, lift, E, P, C, R, Q, arcPts, rrect, mapShape } = AK;
  const TAG = o => Object.assign({ look: 1 }, o || {});
  const put = (k, z, bone, mat, s, o) => k.add(z, bone, mat, s, TAG(o));
  const GOLD = m('#E4B44A', 'metal'), BRASS = m('#C4924A', 'metal'), IRON = m('#5A5464', 'metal');
  const glowM = hex => m(hex, 'glow', { light: hex });
  // The four circles (the Company Cape, Bond Light when a partner has no colour of its own).
  const CIRCLE_COL = { hedgefolk: '#5E9A48', oath: '#E2C25A', dusk: '#7A52B8', wayfarers: '#3E82C4' };

  // ================= capes =================
  // The cape's outline from the shoulders to the calf, flaring back (the hero faces right, so the
  // back edge is what shows). sway: the hem trails 1 art px on moving frames.
  function capeShape(k) {
    const po = k.pose, sw = po.bob || po.dx > 0 || po.lean > .1 ? -1 : 0;
    const hem = k.hiY * .4, u = k.u;
    return P(-k.sw * 1.0, k.shY - .6, k.sw * .5, k.shY - .5, k.sw * .3, k.waY, k.hipW * .3 + sw * .5, hem,
      -k.hipW * .7 + sw, hem + .7, -k.hipW * 1.8 + sw, hem + .5, -k.hipW * 2.8 + sw, hem - .6,
      -k.hipW * 2.45 + sw * .5, k.hiY * .7, -k.sw * 1.62, k.waY + 1 * u, -k.sw * 1.42, k.shY + 1.6);
  }
  // Bands and marks are placed in the part of the cape that shows behind the body.
  const hemY = k => k.hiY * .4;
  function capeBase(k, mat, o) {
    const cp = put(k, .3, 'up', mat, capeShape(k), { bev: 1.2 });
    put(k, 3.72, 'up', o.collar || mat, P(-k.sw * 1.05, k.shY - .6, k.hx + 1.2, k.shY - 1, k.hx + 1.7, k.shY + .9, -k.sw * .85, k.shY + 1.7), { bev: .8, sep: 1 });
    return cp;
  }
  const clasp = (k, mat, o) => put(k, 3.95, 'up', mat, E(k.hx + 1.4, k.shY + .5, 1.1, 1.1), Object.assign({ sep: 1 }, o || {}));
  const hemBand = (k, cp, mat, h, o) => put(k, .31, 'up', mat, R(-30, hemY(k) - h + (k.pose.bob ? .3 : 0), 60, h + 2), Object.assign({ clip: cp }, o || {}));
  const CAPES = {
    c_hollow: { col: '#4E7E3A', draw(k) {   // moss-green wool, a small lantern-shaped clasp
      const wool = m('#4E7E3A'), cp = capeBase(k, wool, { collar: m('#3E6A30') });
      put(k, .305, 'up', m('#5E9046'), R(-30, k.waY + 1, 60, 1.2), { clip: cp, nl: 1 });   // a woven stripe
      hemBand(k, cp, m('#3A5E2C'), 1.3);
      put(k, 3.95, 'up', GOLD, R(k.hx + .6, k.shY - .6, 1.8, 2.8), { sep: 1 });
      put(k, 3.96, 'up', glowM('#FFD27A'), Q(Math.round(k.hx + 1), Math.round(k.shY + .2), 1, 1), { nl: 1, nolight: 1 });
    } },
    c_tide: { col: '#6E8290', draw(k) {   // sea-grey oilcloth, a pearl clasp, a salt-white hem
      const oil = m('#6E8290', 'leather'), cp = capeBase(k, oil, { collar: m('#5A6C7A', 'leather') });
      hemBand(k, cp, m('#E6EEF0'), 1.6, { sep: 1 });
      put(k, .306, 'up', m('#8FA4B0', 'leather'), R(-30, k.hiY * .85, 60, 1), { clip: cp, nl: 1 });   // a sheen line
      clasp(k, m('#F0EAF4', 'gem'));
    } },
    c_tally: { col: '#3A3446', draw(k) {   // near-black, its hem stitched with rows of gold tally marks
      const blk = m('#3A3446'), cp = capeBase(k, blk, { collar: m('#2A2634') });
      const gold = m('#F2C14E', 'flat'), y0 = Math.round(hemY(k) - 3.4 + (k.pose.bob ? .3 : 0)), sw = k.pose.bob || k.pose.dx > 0 || k.pose.lean > .1 ? -1 : 0;
      for (let row = 0; row < 2; row++) {
        const y = y0 - row * 3, x0 = Math.round(-k.hipW * 2.45 + sw + row);
        for (let i = 0; i < 3; i++) put(k, .32, 'up', gold, Q(x0 + i * 2, y, 1, 2), { clip: cp, nl: 1 });
      }
      put(k, .32, 'up', gold, R(-30, hemY(k) - .9 + (k.pose.bob ? .3 : 0), 60, .9), { clip: cp, nl: 1 });
      clasp(k, GOLD);
    } },
    c_company: { col: '#3E82C4', draw(k) {   // quartered in the four circle colours
      const cp = capeBase(k, m(CIRCLE_COL.hedgefolk), { collar: m('#8A6440', 'leather') });
      const xs = -k.hipW * 1.75, ys = k.waY + 1;
      put(k, .31, 'up', m(CIRCLE_COL.oath), R(xs, -40, 30, 40 + ys), { clip: cp });
      put(k, .31, 'up', m(CIRCLE_COL.dusk), R(-30, ys, 30 + xs, 30), { clip: cp });
      put(k, .31, 'up', m(CIRCLE_COL.wayfarers), R(xs, ys, 30, 30), { clip: cp });
      clasp(k, GOLD);
    } },
    c_wyrm: { col: '#A8502E', draw(k) {   // overlapping red-bronze scales, darker at the hem
      const sc = m('#A8502E', 'leather'), cp = capeBase(k, sc, { collar: m('#7E3A24', 'leather') });
      const dk = m('#6E2E22', 'flat'), sw = k.pose.bob || k.pose.dx > 0 || k.pose.lean > .1 ? -1 : 0;
      // scale edges: little arcs in rows, offset each row
      for (let r = 0; r < 6; r++) {
        const y = Math.round(k.shY + 3 + r * 3.2), off = r % 2 ? 1 : 0;
        for (let x = -13 + off; x < 4; x += 3) put(k, .32, 'up', dk, Q(x + (r > 3 ? sw : 0), y, 2, 1), { clip: cp, nl: 1 });
      }
      hemBand(k, cp, m('#6A2A20', 'leather'), 2.2);
      clasp(k, m('#E0B040', 'metal'));
    } },
    c_starlit: { col: '#22307A', draw(k) {   // deep blue, 6 single-pixel stars that twinkle one at a time
      const blue = m('#22307A'), cp = capeBase(k, blue, { collar: m('#1A2462') });
      hemBand(k, cp, m('#2E3E92'), 1.1);
      const po = k.pose, tw = po.bob ? 1 : po.dx ? 3 : po.lean ? 4 : 0, sw = po.bob || po.dx > 0 || po.lean > .1 ? -1 : 0;
      const stars = [[-1.4, .3], [-1.95, .5], [-1.55, .7], [-2.4, .88], [-1.7, .96], [-1.35, .55]];
      stars.forEach(([fx, fy], i) => {
        const y = Math.round(k.shY + (hemY(k) - k.shY) * fy), x = Math.round(k.hipW * fx + (fy > .8 ? sw : 0));
        put(k, .33, 'up', m(i === tw ? '#FFFFFF' : '#C8D4FF', 'flat'), Q(x, y, 1, 1), { clip: cp, nl: 1 });
        if (i === tw) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) put(k, .325, 'up', m('#8A9CE8', 'flat'), Q(x + dx, y + dy, 1, 1), { clip: cp, nl: 1 });
      });
      clasp(k, m('#E8ECFF', 'gem'));
    } }
  };

  // ================= hats =================
  // Relative to the head: hx, hy, hw, hh, top. z 4.55 over the hair; nothing above top - 5.
  const HATS = {
    h_straw: { col: '#E2C474', draw(k) {   // wide, pale straw, a sprig of herb
      const { hx, hw, top } = k, straw = m('#E2C474', 'wood'), band = m('#8A5230', 'leather');
      const cr = put(k, 4.55, 'head', straw, rrect(hx - hw * .8, top - 1.8, hw * 1.6, 4.6, 1.5), { bev: .9 });
      put(k, 4.551, 'head', band, R(hx - hw, top + 1, hw * 2, 1.3), { clip: cr });
      put(k, 4.56, 'head', straw, E(hx + .2, top + 2.9, hw * 1.8, 1.3), { sep: 1, bev: .6 });
      put(k, 4.565, 'head', m('#5EA844', 'flat'), Q(Math.round(hx - hw * .55), Math.round(top - 1.2), 1, 3), { nl: 1 });
      put(k, 4.565, 'head', m('#8ED060', 'flat'), Q(Math.round(hx - hw * .55) - 1, Math.round(top - 2), 1, 2), { nl: 1 });
      put(k, 4.565, 'head', m('#F4F0D0', 'flat'), Q(Math.round(hx - hw * .55) - 1, Math.round(top - 3), 1, 1), { nl: 1 });
    } },
    h_artisan: { col: '#8A5A36', draw(k) {   // leather cap with a brass lens flipped up
      const { hx, hw, top } = k, lea = m('#8A5A36', 'leather');
      put(k, 4.55, 'head', lea, P(arcPts(hx - .2, top + 3, hw * 1.04, 4.4, Math.PI, Math.PI * 2, 12)), { bev: .9 });
      put(k, 4.56, 'head', m('#5A3A26', 'leather'), P(hx + hw * .55, top + 2.1, hx + hw * 1.8, top + 2.5, hx + hw * 1.7, top + 3.5, hx + hw * .5, top + 3.3), { sep: 1 });
      put(k, 4.565, 'head', m('#3A2A24', 'leather'), R(hx - hw * .9, top + .2, hw * 1.7, 1), { nl: 1 });
      put(k, 4.57, 'head', BRASS, E(hx + hw * .1, top - .2, 1.9, 1.8), { sep: 1 });
      put(k, 4.575, 'head', m('#A8E8F0', 'gem'), E(hx + hw * .1, top - .2, 1, .95), { sep: 1 });
      put(k, 4.568, 'head', BRASS, E(hx - hw * .55, top - .1, 1.5, 1.6), { sep: 1 });
    } },
    h_warden: { col: '#2C4C92', draw(k) {   // a deep blue hood with a small lamp badge
      const { hx, hy, hw, hh, u } = k, blue = m('#2C4C92');
      const ox = hx - hw * .12, oy = hy - hh * .02, orx = hw * 1.28, ory = hh * 1.24;
      const ix = hx + hw * .32, iy = hy + hh * .18, irx = hw * .8, iry = hh * .84;
      put(k, .35, 'up', blue, P(ox - orx * .9, oy + ory * .3, ox - orx * .2, oy + ory * .8, k.sw * .3, k.shY + 2 * u, -k.sw * .2, k.shY + (k.waY - k.shY) * .5, -k.sw * 1.05, k.shY + (k.waY - k.shY) * .45), { g: 'lkhood' });
      const ring = put(k, 4.55, 'head', blue, P(arcPts(ox, oy, orx, ory, 0, Math.PI * 2, 22), arcPts(ix, iy, irx, iry, Math.PI * 2, 0, 18)), { bev: 1.2, g: 'lkhood' });
      put(k, 4.552, 'head', m('#4A6CB8'), P(arcPts(ix, iy, irx + 1, iry + 1, 0, Math.PI * 2, 18), arcPts(ix, iy, irx, iry, Math.PI * 2, 0, 18)), { clip: ring });
      const bx = Math.round(ox - orx * .45), by = Math.round(oy - ory * .25);
      put(k, 4.56, 'head', GOLD, R(bx - 1, by - 1, 3, 3), { sep: 1 });
      put(k, 4.565, 'head', glowM('#FFD27A'), Q(bx, by, 1, 1), { nl: 1, lr: 5 });
    } },
    h_night: { col: '#3E5AB0', draw(k) {   // a floppy striped cap with a bobble
      const { hx, hw, top } = k, blue = m('#3E5AB0'), cream = m('#EAE0C8');
      const cap = put(k, 4.55, 'head', blue, P(hx - hw * .98, top + 2.6, hx + hw * .98, top + 2.4, hx + hw * .7, top - 1, hx + hw * .1, top - 2.6, hx - hw * .8, top - 2.4, hx - hw * 1.55, top - .6, hx - hw * 2.0, top + 2.6, hx - hw * 1.55, top + 3, hx - hw * 1.2, top + .8), { bev: .9 });
      put(k, 4.551, 'head', cream, P(hx - hw * 2.2, top + .2, hx + hw, top - 1.6, hx + hw, top - .5, hx - hw * 2.2, top + 1.3), { clip: cap });
      put(k, 4.556, 'head', cream, R(hx - hw * 1.1, top + 1.5, hw * 2.2, 1.4), { clip: cap, sep: 1 });
      put(k, 4.56, 'head', m('#F4F0E4'), E(hx - hw * 1.8, top + 3.6, 1.5, 1.5), { sep: 1 });
    } },
    h_circlet: { col: '#E4B44A', draw(k) {   // a thin gold band with one flame gem
      const { hx, hy, hw, hh } = k, y = hy - hh * .56;
      put(k, 4.55, 'head', GOLD, P(hx - hw * 1.0, y + .4, hx + hw * .2, y - .3, hx + hw * .98, y - .1, hx + hw * .98, y + 1, hx + hw * .2, y + .8, hx - hw * 1.0, y + 1.5), { sep: 1 });
      put(k, 4.56, 'head', GOLD, P(hx + hw * .5, y - 2.4, hx + hw * .95, y + .2, hx + hw * .05, y + .2), { sep: 1 });
      put(k, 4.565, 'head', glowM('#FF8A3A'), E(hx + hw * .5, y - .5, .95, 1.2), { nl: 1, lr: 8, pulse: 1 });
    } }
  };

  // ================= lanterns =================
  // items(s, glass) -> [[mat, shape, opt]] in the held frame: origin at the hand (the hang point),
  // +y down; s is the size (3-4 art px). glass: the glass material (a Flame, the gear's, or the
  // lamp's own). Pieces are tagged acc 'lamp' / 'glass' like the class lanterns.
  const Lp = (mat, s, o) => [mat, s, TAG(Object.assign({ acc: 'lamp' }, o || {}))];
  const Lg = (mat, s, o) => [mat, s, TAG(Object.assign({ acc: 'glass', lr: 20, pulse: 1 }, o || {}))];
  const paper = g => glowM(mix(g.hex, '#FFF4DC', .45));
  const LAMPS = {
    l_gilded: { col: '#E4B44A', items: (s, g) => [   // gold frame, round glass
      Lp(GOLD, R(-.4, -.6, .8, s * .5)),
      Lp(GOLD, P(arcPts(0, s * .6, s * .5, s * .45, Math.PI, Math.PI * 2, 6))),
      Lg(g, E(0, s * 1.05, s * .58, s * .55)),
      Lp(GOLD, R(-.4, s * .55, .8, s * 1.05), { nl: 1 }),
      Lp(GOLD, P(-s * .45, s * 1.5, s * .45, s * 1.5, s * .25, s * 1.85, -s * .25, s * 1.85))
    ] },
    l_tinker: { col: '#C4924A', items: (s, g) => {   // brass with two small gears
      const st = m('#8C8C9C', 'metal'), hub = m('#2A2430', 'flat');
      return [
        Lp(BRASS, R(-.4, -.6, .8, s * .4)),
        Lp(BRASS, R(-s * .5, s * .15, s, s * .35)),
        Lg(g, R(-s * .4, s * .5, s * .8, s * .95)),
        Lp(BRASS, R(-s * .55, s * 1.45, s * 1.1, 1.1)),
        Lp(st, E(s * .62, s * .75, 1.35, 1.35), { sep: 1 }),
        Lp(st, Q(Math.round(s * .62) + 1, Math.round(s * .75) - 2, 1, 1)), Lp(st, Q(Math.round(s * .62) + 1, Math.round(s * .75) + 1, 1, 1)),
        Lp(hub, Q(Math.round(s * .62 - .5), Math.round(s * .75 - .5), 1, 1), { nl: 1 }),
        Lp(st, E(-s * .6, s * 1.25, 1.05, 1.05), { sep: 1 }),
        Lp(hub, Q(Math.round(-s * .6 - .5), Math.round(s * 1.25 - .5), 1, 1), { nl: 1 })
      ];
    } },
    l_moon: { col: '#EFE4C8', items: (s, g) => {   // a round paper lantern with a painted moon
      const red = m('#B83A3A'), ink = m('#34407E', 'flat'), cy = Math.round(s * 1.0);
      return [
        Lp(m('#3A2A24', 'flat'), R(-.3, -.6, .6, s * .45)),
        Lp(red, R(-s * .38, s * .12, s * .76, s * .3)),
        Lg(paper(g), E(0, s * 1.0, s * .72, s * .66), { lr: 22 }),
        Lp(ink, Q(-1, cy - 1, 1, 3), { nl: 1 }), Lp(ink, Q(0, cy - 2, 1, 1), { nl: 1 }), Lp(ink, Q(0, cy + 2, 1, 1), { nl: 1 }),
        Lp(red, R(-s * .38, s * 1.6, s * .76, s * .32))
      ];
    } },
    l_watch: { col: '#5A5464', items: (s, g) => [   // a tall iron night-watch lantern with a hood
      Lp(IRON, R(-.4, -.6, .8, s * .4)),
      Lp(IRON, P(-s * .75, s * .5, 0, -.1, s * .75, s * .5, s * .55, s * .62, -s * .55, s * .62)),
      Lg(g, R(-s * .34, s * .55, s * .68, s * 1.6)),
      Lp(m('#2E2A36', 'flat'), R(-.35, s * .6, .7, s * 1.5), { nl: 1 }),
      Lp(IRON, R(-s * .5, s * 2.1, s, 1.2))
    ] },
    l_well: { col: '#8FF0D8', glass: '#8FF0D8', items: (s, g) => {   // a caged miner's lamp, blue-green glass
      const bar = m('#3A3444', 'flat');
      return [
        Lp(IRON, R(-.4, -.6, .8, s * .35)),
        Lp(IRON, P(arcPts(0, s * .45, s * .45, s * .32, Math.PI, Math.PI * 2, 6))),
        Lg(g, E(0, s * 1.0, s * .52, s * .62)),
        Lp(bar, R(-1.2, s * .5, .7, s * 1.05), { nl: 1 }), Lp(bar, R(.6, s * .5, .7, s * 1.05), { nl: 1 }),
        Lp(bar, R(-s * .55, s * .95, s * 1.1, .7), { nl: 1 }),
        Lp(IRON, R(-s * .55, s * 1.52, s * 1.1, 1.1))
      ];
    } },
    l_store: { col: '#C8A050', items: (s, g) => {   // a square brass lamp with a handle, a shopkeeper's
      const br = m('#C8A050', 'metal');
      return [
        Lp(br, P(arcPts(0, s * .38, s * .5, s * .55, Math.PI, Math.PI * 2, 7), arcPts(0, s * .38, s * .5 - .8, s * .55 - .8, Math.PI * 2, Math.PI, 7))),
        Lp(br, R(-s * .62, s * .32, s * 1.24, 1)),
        Lg(g, R(-s * .52, s * .6, s * 1.04, s * 1.0)),
        Lp(m('#6A4E26', 'flat'), R(-.3, s * .6, .6, s * 1.0), { nl: 1 }),
        Lp(br, R(-s * .62, s * 1.58, s * 1.24, 1.1))
      ];
    } }
  };
  const lampItems = (id, s, glass) => LAMPS[id] ? LAMPS[id].items(s, glass || glowM(LAMPS[id].glass || '#FFD27A')) : [];

  // ================= flames =================
  const FLAMES = { fl_moon: '#CFE0FF', fl_rose: '#FF8A70', fl_kin: '#FFB38A', fl_storm: '#E8F4FF', fl_coin: '#FFD23F' };
  // A Flame look or a Deepwell lantern colour (DEEP_SHOP first: its 'l_moon' shares an id with a Lantern look).
  function flameCol(id) {
    if (!id) return null;
    const d = typeof DEEP_SHOP === 'object' && DEEP_SHOP ? DEEP_SHOP[id] : null;
    if (d && d.kind === 'lantern') return d.col || null;
    return FLAMES[id] || null;
  }

  // ================= apply to a built hero =================
  const DEF_GLASS = glowM('#FFD27A');
  function applyAcc(k, a) {
    if (!a) return k;
    const fl = a.fl ? m(a.fl, 'glow', { light: a.fl }) : null;
    if (a.cape && CAPES[a.cape]) { k.parts = k.parts.filter(p => p.o.acc !== 'back'); CAPES[a.cape].draw(k); }
    if (a.hat && HATS[a.hat]) HATS[a.hat].draw(k);
    const L = a.lamp && LAMPS[a.lamp];
    if (L) {
      const lp = k.lamp || { at: 'hip', x: -k.hipW * .95 };
      const old = k.parts.find(p => p.o.acc === 'glass');
      k.parts = k.parts.filter(p => p.o.acc !== 'lamp' && p.o.acc !== 'glass');
      const glass = fl || (L.glass ? glowM(L.glass) : null) || lp.glass || (old && old.m) || DEF_GLASS;
      if (lp.at === 'held') k.held(lp.z || 5, lp.side || 'B', 0, L.items(lp.s * 1.2, glass));
      else {
        const X = Math.min(lp.x, -k.hipW * 1.2), Y = k.waY + .5;   // at the back hip's edge, so it shows
        L.items(3.7, glass).forEach(([mat, s, o], i) => k.add(3.41 + i * .002, 'up', mat, mapShape(s, (x, y) => [X + x, Y + y], 0), o));
      }
    }
    if (fl) for (const p of k.parts) if (p.o.acc === 'glass' || p.o.acc === 'flame') p.m = fl;
    return k;
  }
  AK.applyAcc = applyAcc;

  // ================= auras (drawn on the stage by 64-looks, not baked on the hero) =================
  // auraPx(id, f, o) -> [[x, y, '#hex'], ...] art px of frame f in a W x H box (default 32 x 12, the
  // ring centre at (W/2, cy)). o: { W, H, rx, ry, cy, cols (Bond Light), open (Lantern Bloom 0-3), flash }.
  // Frames loop: AURAS[id].n frames at AURAS[id].fps.
  const AURAS = {
    a_ember: { n: 6, fps: 6, col: '#FF9E3D', glow: '255,150,60' },
    a_steel: { n: 1, fps: 1, col: '#C9D1DB', glow: '200,215,235' },
    a_star: { n: 12, fps: 3, col: '#B89CFF', glow: '185,156,255' },
    a_bond: { n: 12, fps: 3, col: '#FF8AB0', glow: '255,160,190' },
    a_bloom: { n: 1, fps: 1, col: '#F2C14E', glow: '242,193,78' },
    a_stair: { n: 8, fps: 5, col: '#7FE0D0', glow: '120,230,210' }
  };
  function ringPts(cx, cy, rx, ry) {   // the ellipse's pixels, each once, with its angle
    const out = [], seen = new Set(), n = Math.ceil((rx + ry) * 5);
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, x = Math.round(cx + Math.cos(a) * rx - .5), y = Math.round(cy + Math.sin(a) * ry - .5), key = x * 999 + y;
      if (!seen.has(key)) { seen.add(key); out.push([x, y, a]); }
    }
    return out;
  }
  function auraPx(id, f, o = {}) {
    const W = o.W || 32, H = o.H || 12, rx = o.rx || 13, ry = o.ry || 3, cx = W / 2, cy = o.cy || 8, px = [];
    const pt = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) px.push([x, y, c]); };
    const ring = (c0, c1, every) => ringPts(cx, cy, rx, ry).forEach(([x, y, a], i) => { if (!every || i % every === 0) pt(x, y, Math.sin(a) > 0 ? c0 : c1); });
    switch (id) {
      case 'a_ember': {   // orange sparks drifting up in a ring
        ring('#E0602A', '#8A3A22');
        for (let i = 0; i < 8; i++) {
          const a = i / 8 * Math.PI * 2 + .4, ph = (f + i * 2.3) % 6 / 6, x = cx + Math.cos(a) * rx * .9, y = cy + Math.sin(a) * ry - ph * (cy + 1);
          pt(x, y, ph < .5 ? '#FFD27A' : '#FF9E3D'); if (ph < .3) pt(x, y + 1, '#E0602A');
        }
        break;
      }
      case 'a_steel': {   // a thin silver ring; flashes on a parry
        if (o.flash) { ring('#FFFFFF', '#DCE6F2'); for (const [dx, dy] of [[-rx - 1, 0], [rx + 1, 0], [0, -ry - 2], [0, ry + 1]]) pt(cx + dx - .5, cy + dy - .5, '#FFFFFF'); }
        else ring('#C9D1DB', '#6E7888');
        break;
      }
      case 'a_star': {   // a slow ring of tiny stars
        ring('#5A4A8A', '#3A3060', 2);
        for (let i = 0; i < 5; i++) {
          const a = (i / 5 + f / 12 / 5) * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, c = i % 2 ? '#FFF2B8' : '#D8C8FF';
          pt(x, y, c); if (Math.sin(a) > 0) { pt(x - 1, y, '#9A84E0'); pt(x + 1, y, '#9A84E0'); pt(x, y - 1, '#9A84E0'); }
        }
        break;
      }
      case 'a_bond': {   // small motes in the colours of the hero's Bond partners
        const cols = o.cols && o.cols.length ? o.cols : ['#FF8AB0', '#FFD27A'];
        ring('#7A4A66', '#4A2E44', 3);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6 + f / 12 / 6) * Math.PI * 2, x = cx + Math.cos(a) * (rx - 1), y = cy + Math.sin(a) * ry - 2 - (i % 2) * 2 - Math.sin(f / 12 * Math.PI * 2 + i) * 1;
          const c = cols[i % cols.length]; pt(x, y, c); pt(x + 1, y, c);
        }
        break;
      }
      case 'a_bloom': {   // a gold glow that opens like a flower when the hero wins a boss fight
        const open = o.open || 0;
        ring('#F2C14E', '#A87A2A');
        const petals = 6;
        for (let i = 0; i < petals; i++) {
          const a = i / petals * Math.PI * 2 + Math.PI / 6, r0 = rx * (.55 + .12 * open), c = i % 2 ? '#FFE08A' : '#F2C14E';
          const x = cx + Math.cos(a) * r0, y = cy + Math.sin(a) * (ry * .6), lift = open * 1.3;
          for (let j = 0; j <= 1 + open; j++) pt(x + Math.cos(a) * j * 1.2, y - lift * (j / (1 + open)) + Math.sin(a) * j * .4, j ? c : '#FFF4C8');
        }
        break;
      }
      case 'a_stair': {   // a faint blue-green light rising from the ground
        ring('#4AB8A8', '#2A6A66');
        for (let i = 0; i < 7; i++) {
          const x = cx - rx + 2 + i * (rx * 2 - 4) / 6, ph = (f + i * 3) % 8 / 8, y0 = cy + Math.sin(i * 1.7) * ry * .6, len = 2 + (i % 3);
          for (let j = 0; j < len; j++) pt(x, y0 - ph * (cy - 1) - j, j ? '#4AB8A8' : '#AEF6E6');
        }
        break;
      }
    }
    return px;
  }

  // ================= portrait frames (64-looks paints them round the header portrait) =================
  const FRAMES = {
    fr_bronze: { col: '#C07A45', hi: '#E8A870', lo: '#6A3E22' },
    fr_silver: { col: '#C9D1DB', hi: '#F2F6FA', lo: '#6E7888' },
    fr_gold: { col: '#F2C14E', hi: '#FFE9A8', lo: '#8A6420' },
    fr_ever: { col: '#FF9E3D', hi: '#FFE08A', lo: '#A8401E', flame: 1 }
  };

  // ================= the wear map -> acc =================
  // wear: { cape, hat, lamp, flame, helm } (look ids; flame may be a Deepwell lantern colour).
  // Omitted: read the save through wearGet (58-deeds). Returns null when nothing shows on the hero.
  lookAcc = w => {
    if (!w) {
      if (typeof wearGet !== 'function' || typeof S === 'undefined' || !S || !S.deeds) return null;
      w = { cape: wearGet('cape'), hat: wearGet('hat'), lamp: wearGet('lamp'), flame: wearGet('flame'), helm: wearGet('helm') };
    }
    const a = {};
    if (w.cape && CAPES[w.cape]) a.cape = w.cape;
    if (w.hat && HATS[w.hat] && !w.helm) a.hat = w.hat;
    if (w.lamp && LAMPS[w.lamp]) a.lamp = w.lamp;
    const fc = flameCol(w.flame); if (fc) a.fl = fc;
    return a.cape || a.hat || a.lamp || a.fl ? a : null;
  };
  lookFlameCol = flameCol;
  const ids = () => [].concat(Object.keys(CAPES), Object.keys(HATS), Object.keys(LAMPS), Object.keys(FLAMES), Object.keys(AURAS), Object.keys(FRAMES));
  return { CAPES, HATS, LAMPS, FLAMES, AURAS, FRAMES, CIRCLE_COL, lampItems, auraPx, flameCol, applyAcc, ids, glowM };
})();
