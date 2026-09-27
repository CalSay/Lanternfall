// 12e-art-dusk: the Dusk Company circle in B1 (Kestrel, Isolde, Oriel, Corvin). DATA only.
// Entry format: see 12c-art-hedgefolk.js. Kit and rules: 12a-art-body.js, docs/design/art-direction.md.
{
  const { m, E, P, C, R, Q, arcPts, rrect, legs, torsoShape, robeShape, arm, head, face, hairShort, hood, belt, SKINS } = AK;

  // ---------------- Kestrel Thane, the Skyfall Dragoon (Rare striker, melee) ----------------
  // Silhouette: two white wings on the helm, a folded-wing cape with feather tips, a spear taller than she is.
  AK.CHARS.kestrel = { name: 'Kestrel', circle: 'dusk', hs: 1.04, ws: .92, aF: -.2, aB: -.3, anim: 'thrust', eye: '#1E1418',
    wpn: { fam: 'wood', fam2: 'ore', t: 2, r: 1 },
    build(k, w) {
      const u = k.u, { hx, hy, hw, hh } = k;
      const teal = m('#2B7470'), tealL = m('#46948A'), tealD = m('#1E4C50'), blue = m('#3C5486'), steel = m('#7E9CC0', 'metal'), steelD = m('#566A8E', 'metal'),
        white = m('#E4EAF2'), whiteD = m('#B8C4D4'), lea = m('#5A3E2E', 'leather'), skin = m(SKINS[1], 'skin'), hair = m('#2A2030', 'hair');
      // cape shaped like a folded wing: coverts on top, long flight feathers below, tips pointing back
      const cp = k.add(.2, 'up', teal, P(-k.sw * .6, k.shY - 1.2, k.sw * .3, k.shY, -k.sw * .1, k.waY, -k.hipW * .45, k.hiY * .5,
        -k.hipW * .8, k.hiY * .3, -k.hipW * .95, k.hiY * .52, -k.hipW * 1.3, k.hiY * .22, -k.hipW * 1.5, k.hiY * .46,
        -k.hipW * 1.85, k.hiY * .12, -k.hipW * 2, k.hiY * .38, -k.hipW * 2.7, k.hiY * .02, -k.sw * 2.05, k.waY + 1.5, -k.sw * 2.05, k.shY + 2.8, -k.sw * 1.55, k.shY - 1.4), { bev: 1 });
      k.add(.22, 'up', tealL, P(-30, k.shY - 6, 10, k.shY - 6, 10, k.waY - 1, -k.sw * .6, k.waY + .4, -k.sw * .9, k.waY - 1.4, -k.sw * 1.2, k.waY + .4, -k.sw * 1.5, k.waY - 1.4, -k.sw * 1.8, k.waY + .2, -k.sw * 2.1, k.waY - 1.6, -30, k.waY - 1), { clip: cp, sep: 1 });
      k.add(.24, 'up', tealD, P(-k.hipW * 1.15, k.hiY * .75, -k.hipW * .95, k.hiY * .75, -k.hipW * 1.3, k.hiY * .3, -k.hipW * 1.45, k.hiY * .35), { clip: cp, nl: 1 });
      k.add(.24, 'up', tealD, P(-k.hipW * 1.75, k.hiY * .7, -k.hipW * 1.55, k.hiY * .72, -k.hipW * 1.85, k.hiY * .2, -k.hipW * 2, k.hiY * .25), { clip: cp, nl: 1 });
      legs(k, blue, steelD, { greave: steel, sole: lea });
      arm(k, 'B', blue, lea, { bracer: steel, cuff: lea });
      k.add(1.3, 'armB', steelD, E(k.pB[0] - .2 * u, k.pB[1] - .2 * u, k.armR * 1.5, k.armR * 1.2));
      // blue tunic with a split skirt, steel breastplate with a teal sash
      const tn = k.add(3, 'up', blue, torsoShape(k, { bot: k.hiY * .45, bw: 1.3 }));
      k.add(3.02, 'up', tealD, P(k.hipW * .15, k.hiY * .75, k.hipW * .45, k.hiY * .75, k.hipW * .35, k.hiY * .4, k.hipW * .05, k.hiY * .4), { clip: tn });
      k.add(3.1, 'up', steel, P(-k.sw * .82, k.shY + .5, k.sw * .9, k.shY + .5, k.sw * .88, k.waY - 2, k.sw * .5, k.waY - .5, -k.sw * .75, k.waY - .5), { bev: 1.2 });
      k.add(3.2, 'up', teal, P(k.sw * .55, k.shY + .6, k.sw * .9, k.shY + 1.6, -k.sw * .45, k.waY - .4, -k.sw * .8, k.waY - 1.4));
      belt(k, lea, { buckle: steel, w: 1.8 });
      k.add(3.8, 'up', steelD, E(k.hx - .3 * u, k.shY + .3 * u, k.sw * .5, k.U(1.8)));
      head(k, skin); face(k, { eye: this.eye, brow: '#241A18' });
      hairShort(k, hair, { long: 1.15 });
      // winged helm: open-faced cap with a cheek guard, one wing on each side
      k.add(.45, 'head', whiteD, P(hx - hw * .1, hy - hh * .8, hx - hw * .15, hy - hh * 1.7, hx - hw * .55, hy - hh * 2.45, hx - hw * .75, hy - hh * 2, hx - hw * 1.05, hy - hh * 2.05, hx - hw * .95, hy - hh * 1.35, hx - hw * .7, hy - hh * .8), { bev: .8 });
      const helm = k.add(4.3, 'head', steel, P(hx - hw * 1.15, hy + hh * .55, arcPts(hx - hw * .05, hy + hh * .05, hw * 1.12, hh * 1.12, Math.PI * .96, Math.PI * 1.97, 12), hx + hw * 1.15, hy - hh * .28, hx + hw * .45, hy - hh * .42, hx - hw * .25, hy - hh * .3, hx - hw * .35, hy + hh * .3), { sep: 1 });
      k.add(4.32, 'head', w.r >= 1 ? w.R : steelD, R(hx - hw * 1.3, hy - hh * .62, hw * 2.6, k.U(1)), { clip: helm });
      k.add(4.45, 'head', white, P(hx - hw * .55, hy - hh * .55, hx - hw * .95, hy - hh * 1.45, hx - hw * 1.85, hy - hh * 2.15, hx - hw * 1.6, hy - hh * 1.45, hx - hw * 2.2, hy - hh * 1.3, hx - hw * 1.55, hy - hh * .8, hx - hw * 1.95, hy - hh * .45, hx - hw * 1.05, hy - hh * .1), { bev: .8, sep: 1 });
      k.add(4.46, 'head', whiteD, P(hx - hw * 1.2, hy - hh * .9, hx - hw * 1.6, hy - hh * 1.45, hx - hw * 1.9, hy - hh * 1.35, hx - hw * 1.4, hy - hh * .75), { nl: 1 });
      arm(k, 'F', blue, lea, { bracer: steel, cuff: lea });
      // the long spear (role weapon): shaft in the tier's wood, head in the tier's ore, a teal pennant
      const up = k.H * .8, dn = k.H * .3;
      k.held(7, 'F', .1, [
        [w.P, R(-.6, -up, 1.2, up + dn)],
        [w.r >= 1 ? w.R : steelD, R(-1.1, -up, 2.2, 1.2)],
        [w.Q, P(0, -up - 6, 1.8, -up - 2.4, 1, -up, -1, -up, -1.8, -up - 2.4), { bev: .6 }],
        [teal, P(.6, -up + 1.4, 2.8, -up + 1.4, 3.6, -up + 3, 2.6, -up + 3.2, 3.4, -up + 4.8, .6, -up + 4.2)],
        w.G ? [w.G, R(-.3, -up - 4.6, .6, 3.4), { nl: 1, lr: 7 }] : null
      ]);
      k.add(6.4, 'armF', steel, E(k.pF[0] + .3 * u, k.pF[1] - .1 * u, k.armR * 1.75, k.armR * 1.35));
      k.add(6.42, 'armF', white, P(k.pF[0] - k.armR * 1.1, k.pF[1] - k.armR * .9, k.pF[0] - k.armR * .2, k.pF[1] - k.armR * 1.2, k.pF[0] - k.armR * 1.6, k.pF[1] - k.armR * 2.1), { nl: 1 });
    } };

  // ---------------- Isolde Marrow, the Duskblade (Epic striker, melee) ----------------
  // Silhouette: narrow, a high tail of black hair, a half mask under bright eyes, two short blades.
  AK.CHARS.isolde = { name: 'Isolde', circle: 'dusk', hs: 1, ws: .84, aF: -.35, aB: .15, anim: 'twin', eye: '#1A1020',
    wpn: { fam: 'ore', fam2: 'hide', t: 3, r: 2, glow: '#F0A0B8' },
    build(k, w) {
      const u = k.u, { hx, hy, hw, hh } = k;
      const dusk = m('#2E2838'), duskD = m('#1E1A26'), rose = m('#C05C78'), roseD = m('#8A3A56'), lea = m('#4A3438', 'leather'), skin = m(SKINS[0], 'skin'), hair = m('#1E1620', 'hair'),
        page = m('#E0D2B0', 'cloth'), ink = m('#5A4A3A', 'flat'), seal = m('#B02E3A', 'flat'), mask = m('#3C3046');
      // high tail of black hair, tied at the crown, falling down her back
      k.add(.5, 'head', hair, P(hx - hw * .45, hy - hh * 1.1, hx - hw * 1.05, hy - hh * 1.3, hx - hw * 1.65, hy - hh * .75, hx - hw * 1.9, hy + hh * .5, hx - hw * 1.65, hy + hh * 1.7, hx - hw * 1.3, hy + hh * 1.1, hx - hw * 1.15, hy + hh * .1, hx - hw * .8, hy - hh * .55));
      k.add(.52, 'head', rose, rrect(hx - hw * 1.2, hy - hh * 1.2, k.U(2.2), k.U(1.8), .4));
      // rose sash ends trailing behind
      k.add(.3, 'up', rose, P(-k.sw * .6, k.waY - .5, -k.sw * .3, k.waY + .5, -k.sw * 1.3, k.waY + 6.5, -k.sw * 1.55, k.waY + 5.2, -k.sw * 1.85, k.waY + 5.6));
      legs(k, dusk, duskD, { cuff: rose, sole: lea });
      arm(k, 'B', dusk, lea, { cuff: lea });
      // fitted dusk leathers, a rose sash across the chest, short leather tassets
      k.add(3, 'up', dusk, torsoShape(k, { bot: k.hiY * .6, bw: 1.1, ww: .8 }), { bev: 1.1 });
      k.add(3.05, 'up', lea, P(-k.hipW * 1.1, k.waY + .5, k.hipW * 1.15, k.waY + .5, k.hipW * 1.25, k.hiY * .72, -k.hipW * 1.15, k.hiY * .72), { bev: .8 });
      k.add(3.2, 'up', rose, P(-k.sw * .8, k.shY + .6, -k.sw * .4, k.shY + .3, k.sw * .88, k.waY - .6, k.sw * .55, k.waY + .6));
      belt(k, roseD, { w: 1.8, buckle: m('#C8C0D0', 'metal') });
      // the torn contract pinned to her belt: a page with two lines of writing, a torn edge and a wax seal
      const cx0 = k.sw * .05, cy0 = k.waY + .4;
      const pg = k.add(3.4, 'up', page, P(cx0, cy0, cx0 + 3.6, cy0, cx0 + 3.8, cy0 + 4.2, cx0 + 3, cy0 + 3.4, cx0 + 2.2, cy0 + 4.8, cx0 + 1.3, cy0 + 3.9, cx0 + .4, cy0 + 5), { bev: .6 });
      k.add(3.41, 'up', ink, R(cx0 + .6, cy0 + 1.6, 2.4, .8), { clip: pg, nl: 1 });
      k.add(3.41, 'up', ink, R(cx0 + .6, cy0 + 3, 1.4, .8), { clip: pg, nl: 1 });
      k.add(3.42, 'up', seal, Q(Math.round(cx0 + 2.6), Math.round(cy0 - .4), 1, 1), { nl: 1 });
      head(k, skin); face(k, { eye: this.eye, brow: '#1E1620' });
      hairShort(k, hair);
      // half mask over nose and mouth, below the eyes, tied behind with rose ribbons
      k.add(4.5, 'head', mask, P(hx - hw * .4, hy + hh * .5, hx + hw * .2, hy + hh * .42, hx + hw * 1.14, hy + hh * .36, hx + hw * 1.06, hy + hh * .85, hx + hw * .45, hy + hh * 1.12, hx - hw * .3, hy + hh * 1), { sep: 1 });
      k.add(4.45, 'head', rose, P(hx - hw * .9, hy + hh * .4, hx - hw * .55, hy + hh * .45, hx - hw * .6, hy + hh * .8, hx - hw * 1.3, hy + hh * 1.2), { nl: 1 });
      // twin short blades (role weapon): back hand reverse grip, front hand forward
      const dl = k.H * .26;
      const blade = () => [
        [lea, R(-k.U(.8), -k.U(2), k.U(1.6), k.U(4))],
        [w.r >= 1 ? w.R : w.D, R(-k.U(2.2), -k.handR - k.U(1.2), k.U(4.4), k.U(1.1))],
        [w.P, P(-1.1, -k.handR - k.U(1.2), 1.1, -k.handR - k.U(1.2), .9, -dl + 1.6, 0, -dl, -.9, -dl + 1.6), { bev: .6 }],
        w.G ? [w.G, R(-.3, -dl + 2, .6, dl * .5), { nl: 1, lr: 7 }] : null
      ];
      k.held(5.5, 'B', 2.8, blade());
      arm(k, 'F', dusk, lea, { cuff: lea });
      k.held(7, 'F', .5, blade());
      const sp = k.add(6.4, 'armF', duskD, E(k.pF[0] + .2 * u, k.pF[1], k.armR * 1.45, k.armR * 1.15));
      k.add(6.42, 'armF', rose, R(k.pF[0] - 5, k.pF[1] + k.armR * .45, 10, k.U(.9)), { clip: sp });
    } };

  // ---------------- Oriel Vess, the Starcaller (Epic caster) ----------------
  // Silhouette: tall, a stiff standing collar framing her head, a staff with a star hung from its crook.
  AK.CHARS.oriel = { name: 'Oriel', circle: 'dusk', hs: 1.08, ws: .92, aF: -.3, aB: -.2, anim: 'cast', eye: '#1A1420',
    wpn: { fam: 'wood', fam2: 'crystal', t: 3, r: 2 },
    build(k, w) {
      const u = k.u, { hx, hy, hw, hh } = k;
      const indigo = m('#3A3480'), indigoD = m('#28245A'), lilac = m('#C8B8EC'), gold = m('#E0AE44', 'metal'), skin = m(SKINS[2], 'skin'), hair = m('#1E1A2C', 'hair'),
        star = m('#F4EEFF', 'glow', { light: '#C8C0FF' }), pt = m('#E4DCFF', 'flat'), chain = m('#C8C0D8', 'flat');
      legs(k, indigoD, m('#2A2238', 'leather'), {});
      arm(k, 'B', indigo, skin, { bell: indigo, bellTrim: lilac });
      // floor-length star-pricked robe with a lilac front band and hem
      const hem = -k.U(.4);
      const rb = k.add(3, 'up', indigo, robeShape(k, { hem, flare: 1.05 }), { bev: 1.2 });
      k.add(3.05, 'up', lilac, P(k.sw * .1, k.shY, k.sw * .45, k.shY, k.hipW * .75, hem, k.hipW * .2, hem), { clip: rb });
      k.add(3.06, 'up', lilac, R(-20, hem - k.U(1.3), 40, k.U(1.3)), { clip: rb });
      for (const [x, y] of [[-.55, .3], [-.25, .55], [.75, .45], [-.7, .8], [.95, .9], [-.1, .9], [.6, .72]]) k.add(3.1, 'up', pt, Q(Math.round(k.sw * x), Math.round(k.shY + (hem - k.shY) * y), 1, 1), { nl: 1 });
      k.add(3.3, 'up', gold, R(-k.sw * .82, k.waY - k.U(.6), k.sw * 1.64, k.U(1.2)));
      k.add(3.35, 'up', gold, E(k.sw * .3, k.waY + .1, 1.2, 1.2));
      head(k, skin); face(k, { eye: this.eye, brow: '#1A1420' });
      hairShort(k, hair, { long: 1.3 });
      // the tall standing collar: a stiff flare behind the head and a front flap up to the jaw, lilac inside
      k.add(3.8, 'up', lilac, P(-k.sw * .05, k.shY + 1, -k.sw * 1.1, k.shY + 1.2, hx - hw * 1.75, hy + hh * .15, hx - hw * 1.85, hy - hh * .75, hx - hw * 1.1, hy - hh * .6, hx - hw * .5, hy + hh * .2, hx, k.shY - .2), { bev: .8 });
      k.add(3.81, 'up', indigo, P(-k.sw * .05, k.shY + 1, -k.sw * .95, k.shY + 1.2, hx - hw * 1.55, hy + hh * .2, hx - hw * 1.6, hy - hh * .45, hx - hw * 1.05, hy - hh * .35, hx - hw * .5, hy + hh * .3, hx, k.shY - .1), { bev: .9, nl: 1 });
      const cf = k.add(4.45, 'up', indigo, P(hx - hw * .15, k.shY + .6, k.sw * 1, k.shY + .9, hx + hw * 1.35, hy + hh * .05, hx + hw * 1.05, hy + hh * .2, hx + hw * .35, hy + hh * .95, hx - hw * .2, hy + hh * 1.05), { bev: .9 });
      k.add(4.46, 'up', lilac, P(hx + hw * 1.05, hy + hh * .2, hx + hw * 1.35, hy + hh * .05, hx + hw * 1.3, hy + hh * .5, hx + hw * .5, hy + hh * 1.25, hx + hw * .3, hy + hh * .95), { clip: cf, nl: 1 });
      k.add(4.47, 'up', gold, Q(Math.round(hx + hw * .2), Math.round(k.shY - .2), 1, 1), { nl: 1 });
      arm(k, 'F', indigo, skin, { bell: indigo, bellTrim: lilac });
      // staff with a crook; a star hangs from it on a short chain (role weapon)
      const up = k.H * .74, dn = k.H * .24, sx = 4.4, sy = -up + 4.2, r1 = 2.6, r2 = 1.1;
      const starPts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; starPts.push(sx + Math.cos(a) * r, sy + Math.sin(a) * r); }
      k.held(5.9, 'F', .05, [
        [w.P, R(-.6, -up, 1.2, up + dn)],
        [w.P, P(-.6, -up, -.4, -up - 2.4, 1.6, -up - 3.8, 4, -up - 3.6, 5.2, -up - 2.2, 4.8, -up - .8, 3.8, -up - 2.2, 1.8, -up - 2.4, .6, -up - 1.2, .6, -up + .6)],
        [chain, R(4.1, -up - 1, .6, 3), { nl: 1 }],
        [w.r >= 2 ? w.C : star, P(starPts), { lr: 16, pulse: 1 }],
        w.r >= 1 ? [w.R, R(-1, -up + 3, 2, 1.2)] : null
      ]);
    } };

  // ---------------- Corvin Black, the Hollow King's Blade (Legendary striker, melee) ----------------
  AK.CHARS.corvin = { name: 'Corvin', circle: 'dusk', hs: 1.1, ws: .96, aF: -.35, aB: .2, anim: 'twin', eye: '#000',
    wpn: { fam: 'ore', fam2: 'hide', t: 4, r: 3, glow: '#C49CFF' },
    build(k, w) {
      const u = k.u;
      const coat = m('#2C2838'), coatD = m('#1C1926'), bone = m('#E8DCC6'), violet = m('#A274EC'), lea = m('#3E3034', 'leather'), boot = m('#221E28', 'leather'), skin = m(SKINS[1], 'skin'), glow = m('#C49CFF', 'glow', { light: '#A070FF' });
      const hem = k.hiY * .12;
      // coat tails flaring back
      const tl = k.add(.2, 'up', coat, P(-k.sw * .8, k.waY, k.sw * .2, k.waY, -k.hipW * .3, hem, -k.hipW * 1.4, hem + k.U(1), -k.hipW * 2.3, hem - k.U(2.5), -k.hipW * 1.5, k.hiY * .6), { bev: 1 });
      k.add(.25, 'up', violet, P(-k.hipW * 3, hem - k.U(4), k.hipW, hem - k.U(1.2), k.hipW, hem + 5, -k.hipW * 3, hem + 5), { clip: tl });
      legs(k, m('#2A2630'), boot, { cuff: bone });
      arm(k, 'B', coat, lea, { bracer: bone, cuff: lea });
      const cb = k.add(3, 'up', coat, P(-k.sw * .82, k.shY, k.sw * .86, k.shY, k.sw, k.shY + 2 * u, k.sw * .78, k.waY, k.hipW * 1.25, hem, -k.hipW * .4, hem, -k.sw * .78, k.waY, -k.sw, k.shY + 2 * u), { bev: 1.1 });
      k.add(3.05, 'up', violet, R(-30, hem - k.U(1.4), 60, k.U(1.4)), { clip: cb });
      k.add(3.06, 'up', coatD, P(k.sw * .3, k.shY + 1 * u, k.sw * .5, k.shY + 1 * u, k.hipW * .6, hem, k.hipW * .35, hem), { clip: cb });
      // crossing straps, a belt with a bone buckle and a pouch
      k.add(3.2, 'up', lea, P(k.sw * .7, k.shY + 1 * u, k.sw * 1, k.shY + 2 * u, -k.sw * .6, k.waY + .5 * u, -k.sw * .9, k.waY - .6 * u));
      k.add(3.3, 'up', lea, R(-k.sw * .85, k.waY - k.U(1), k.sw * 1.7, k.U(2.2)));
      k.add(3.35, 'up', bone, R(k.sw * .05, k.waY - k.U(1), k.U(1.6), k.U(2.2)));
      k.add(3.4, 'up', lea, rrect(k.sw * .45, k.waY + k.U(1), k.U(2.6), k.U(3), k.U(.8)));
      // crown-shaped clasp at the chest
      const cx = k.sw * .1, cy = k.shY + 2.5 * u, cs = 1;
      k.add(3.8, 'up', bone, P(cx - 2 * cs, cy + 1.5 * cs, cx + 2 * cs, cy + 1.5 * cs, cx + 2 * cs, cy - 1.4 * cs, cx + 1 * cs, cy - .2 * cs, cx, cy - 1.8 * cs, cx - 1 * cs, cy - .2 * cs, cx - 2 * cs, cy - 1.4 * cs));
      k.add(3.82, 'up', glow, Q(cx - .5, cy, 1, 1), { nl: 1, nolight: 1 });
      // hood up, face never shown
      head(k, skin);
      hood(k, coat, { shadow: '#07050B', trim: violet, peak: 1 });
      // curved daggers (role weapon): one forward, one reverse grip
      const dl = k.H * .26, dw = 1.15;
      const blade = () => [
        [lea, R(-k.U(.8), -k.U(2), k.U(1.6), k.U(4))],
        [bone, R(-k.U(2.4), -k.handR - k.U(1.2), k.U(4.8), k.U(1.2))],
        [w.P, P(-dw * .8, -k.handR - k.U(1.2), dw * .8, -k.handR - k.U(1.2), dw * 1.8, -dl * .6, dw * 2.8, -dl, dw * .7, -dl * .55), { bev: .6 }],
        [w.G || glow, P(dw * .8, -k.handR - k.U(1.2), dw * 1.05, -k.handR - k.U(1.2), dw * 2.2, -dl * .62, dw * 2.8, -dl, dw * 1.8, -dl * .6), { lr: 8, nl: 1 }]
      ];
      k.held(5.5, 'B', 2.6, blade());
      arm(k, 'F', coat, lea, { bracer: bone, cuff: lea });
      k.held(7, 'F', .55, blade());
      k.add(6.4, 'armF', coatD, E(k.pF[0] + .2 * u, k.pF[1], k.armR * 1.45, k.armR * 1.15));
    } };
}
