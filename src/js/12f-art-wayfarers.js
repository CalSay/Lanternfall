// 12f-art-wayfarers: the Wayfarers circle in B1 (Thessaly, Grenna, Morwen, Vesper). DATA only.
// Entry format: see 12c-art-hedgefolk.js. Kit and rules: 12a-art-body.js, docs/design/art-direction.md.
{
  const { m, E, P, C, R, Q, arcPts, rrect, legs, torsoShape, robeShape, arm, head, face, hairShort, hood, belt, SKINS } = AK;

  // ---------------- Thessaly Gloam, the Bog Seer (Rare caster) ----------------
  AK.CHARS.thessaly = { name: 'Thessaly', circle: 'wayfarers', hs: 1, ws: .86, aF: -.3, aB: -.1, anim: 'cast', eye: '#1E2418', pose: { lean: .12, hb: .6 },
    wpn: { fam: 'wood', fam2: 'crystal', t: 2, r: 1 },
    build(k, w) {
      const u = k.u;
      const murk = m('#4A5A36'), shawl = m('#56706C'), reed = m('#A8985C'), reedD = m('#6E6440'), skin = m(SKINS[1], 'skin'), hair = m('#9A9A88', 'hair'), bog = m('#B8F08A', 'glow', { light: '#A0E678' });
      legs(k, m('#3A3A30'), m('#3E3428', 'leather'), {});
      arm(k, 'B', murk, skin, { bell: murk });
      // ragged floor-length robe (jagged hem), grey-teal shawl, reed belt and a gourd
      const hem = -k.U(.4), fl = 1;
      k.add(3, 'up', murk, P(-k.sw * .82, k.shY, k.sw * .86, k.shY, k.sw, k.shY + 2 * u, k.sw * .8, k.waY, k.hipW * 1.3, k.hiY * .3, k.hipW * 1.65, hem, k.hipW * .9, hem - 1.2, k.hipW * .3, hem, -k.hipW * .4, hem - 1.3, -k.hipW * 1.1, hem, -k.hipW * 1.55, hem - 1, -k.hipW * 1.3, k.hiY * .3, -k.sw * .8, k.waY, -k.sw, k.shY + 2 * u), { bev: 1.2 });
      k.add(3.6, 'up', shawl, P(-k.sw * 1.12, k.shY + 2, arcPts(0, k.shY + 1.4, k.sw * 1.1, 2.6, Math.PI, Math.PI * 2, 6), k.sw * 1.15, k.shY + 2, k.sw * .6, k.shY + 5.5, k.sw * .1, k.shY + 7.5, -k.sw * .5, k.shY + 5.5), { bev: 1 });
      k.add(3.3, 'up', reed, R(-k.sw * .82, k.waY - k.U(.6), k.sw * 1.64, k.U(1.2)));
      k.add(3.4, 'up', reedD, E(-k.sw * .55, k.waY + 2.4, 1.6, 2));
      head(k, skin); face(k, { eye: this.eye, brow: '#6A6A5A' });
      hairShort(k, hair, { long: 1.5 });
      const { hx, hy, hw, hh } = k;
      // wide reed hat: flat brim and a low peak
      k.add(4.5, 'head', reed, E(hx + hw * .1, hy - hh * .55, hw * 2.1, hh * .3), { sep: 1 });
      const cr = k.add(4.45, 'head', reed, P(hx - hw * .95, hy - hh * .6, hx + hw * 1.1, hy - hh * .6, hx + hw * .5, hy - hh * 1.35, hx - hw * .2, hy - hh * 1.6, hx - hw * .75, hy - hh * 1.2), { bev: 1 });
      k.add(4.47, 'head', reedD, R(hx - hw * 1.2, hy - hh * .95, hw * 2.4, k.U(1)), { clip: cr });
      arm(k, 'F', murk, skin, { bell: murk });
      // staff hung with little bottles (role weapon)
      const up = k.H * .64, dn = k.H * .3;
      k.held(5.9, 'F', .1, [
        [w.P, R(-.6, -up, 1.2, up + dn)],
        [w.P, P(-.6, -up, 3.8, -up - 1.2, 4.2, -up - .2, .6, -up + 1)],
        [m('#E8DEC8', 'flat'), R(3, -up - .4, .4, 2), { nl: 1 }],
        [bog, rrect(2.2, -up + 1.4, 2, 2.6, .6), { lr: 10, pulse: 1 }],
        [w.r >= 2 ? w.C : m('#8ACCD8', 'gem'), rrect(-2.6, -up + 2, 1.8, 2.2, .5)],
        [m('#E8DEC8', 'flat'), R(-1.9, -up, .4, 2), { nl: 1 }],
        w.r >= 1 ? [w.R, R(-1, -up + 5, 2, 1)] : null
      ]);
    } };

  // ---------------- Grenna Holt, the Stonebreaker (Epic tank) ----------------
  AK.CHARS.grenna = { name: 'Grenna', circle: 'wayfarers', hs: 1.08, ws: 1.36, armW: 1.12, handS: 1.12, aF: -.55, aB: -.95, anim: 'heavy', eye: '#2E1E18',
    wpn: { fam: 'ore', fam2: 'wood', t: 2, r: 2 },
    build(k, w) {
      const u = k.u;
      const slate = m('#56607A'), rust = m('#B0543A'), apron = m('#7C5234', 'leather'), dlea = m('#4A3226', 'leather'), boot = m('#4A3A30', 'leather'), stone = m('#8A8E9A', 'stone'), skin = m(SKINS[1], 'skin'), hair = m('#8A3A22', 'hair'), blue = m('#3E63C9'), wood = m('#6A4A30', 'wood'), rune = m('#FFB050', 'glow', { light: '#FF9A40' });
      legs(k, slate, boot, { toe: w.P, cuff: dlea });
      arm(k, 'B', rust, skin, { bare: skin, cuff: dlea, big: 1.1 });
      k.add(3, 'up', rust, torsoShape(k, { bot: k.hiY + k.legR * .5, ww: .9 }));
      // leather apron with a bib and a pocket
      const ap = k.add(3.2, 'up', apron, P(-k.sw * .45, k.shY + 2.5 * u, k.sw * .6, k.shY + 2.5 * u, k.sw * .7, k.waY, k.hipW * 1.2, k.hiY * .25, -k.hipW * 1.05, k.hiY * .25, -k.sw * .55, k.waY), { bev: 1.1 });
      k.add(3.22, 'up', m('#5E3E28', 'leather'), rrect(k.sw * .02, k.waY + k.U(2.5), k.U(5), k.U(4), k.U(1)), { clip: ap });
      k.add(3.25, 'up', dlea, P(-k.sw * .45, k.shY + 2.5 * u, -k.sw * .3, k.shY + 2.5 * u, -k.sw * .1, k.shY - .5 * u, -k.sw * .28, k.shY - .5 * u));
      k.add(3.3, 'up', dlea, R(-k.sw * .95, k.waY - k.U(1.2), k.sw * 1.9, k.U(2.6)));
      k.add(3.35, 'up', m('#8E929E', 'metal'), rrect(k.sw * .1, k.waY - k.U(1.4), k.U(2.6), k.U(3), k.U(.6)));
      // head: auburn bun, blue kerchief, heavy brows
      head(k, skin); face(k, { eye: this.eye, brow: '#5A2414' });
      const { hx, hy, hw, hh } = k;
      hairShort(k, hair);
      k.add(.5, 'head', hair, E(hx - hw * .95, hy - hh * .55, hw * .45, hh * .42));
      k.add(4.25, 'head', blue, P(arcPts(hx - hw * .05, hy + hh * .02, hw * 1.1, hh * 1.12, Math.PI * 1.02, Math.PI * 1.95, 10), hx + hw * .9, hy - hh * .38, hx - hw * .2, hy - hh * .55, hx - hw * 1.08, hy - hh * .1));
      k.add(.55, 'head', blue, P(hx - hw * 1.05, hy - hh * .2, hx - hw * 1.8, hy + hh * .2, hx - hw * 1.6, hy + hh * .5, hx - hw * .95, hy + hh * .1));
      // front arm: bare forearm, stone pauldron strapped on
      arm(k, 'F', rust, skin, { bare: skin, cuff: dlea, big: 1.12 });
      const pd = k.add(6.4, 'armF', stone, P(k.pF[0] - k.armR * 1.3, k.pF[1] - k.armR * .3, k.pF[0] + k.armR * .5, k.pF[1] - k.armR * 1, k.pF[0] + k.armR * 1.8, k.pF[1] - k.armR * .1, k.pF[0] + k.armR * 1.6, k.pF[1] + k.armR * 1.3, k.pF[0] - k.armR * 1.2, k.pF[1] + k.armR * 1.1), { bev: .9 });
      k.add(6.45, 'armF', dlea, R(k.pF[0] - 10, k.pF[1] + k.armR * .1, 20, k.U(1.2)), { clip: pd });
      // the maul (role weapon), head planted on the ground in front of her
      const hw2 = 3.75, hh2 = 2.6, hl = -k.hF[1] - hh2 - .5;
      k.held(7, 'F', -.32, [
        [wood, R(-k.U(.9), -k.U(3.5), k.U(1.8), hl + k.U(3.5))],
        [dlea, R(-k.U(1.1), -k.U(4), k.U(2.2), k.U(2))],
        [stone, rrect(-hw2, hl - hh2, hw2 * 2, hh2 * 2, 1), { bev: .9 }],
        [w.P, R(-hw2 * .7, hl - hh2, 1.2, hh2 * 2)],
        [w.G || rune, P(-hw2 * .1, hl - hh2 * .6, hw2 * .15, hl - hh2 * .1, -hw2 * .02, hl + hh2 * .2, hw2 * .2, hl + hh2 * .6, hw2 * .06, hl + hh2 * .65, -hw2 * .1, hl + hh2 * .2, 0, hl - hh2 * .1, -hw2 * .25, hl - hh2 * .55), { lr: 10, nl: 1 }]
      ]);
    } };

  // ---------------- Morwen Tallow, the Candlewitch (Epic caster) ----------------
  AK.CHARS.morwen = { name: 'Morwen', circle: 'wayfarers', hs: .98, ws: .96, aF: -.3, aB: -.2, anim: 'cast', eye: '#2A1A2A', pose: { lean: .14, hb: .7 },
    wpn: { fam: 'wood', fam2: 'ore', t: 2, r: 2 },
    build(k, w) {
      const u = k.u;
      const witch = m('#2A2230'), witchD = m('#1C1622'), wax = m('#E8E0CC'), skin = m('#DCCCBC', 'skin'), hair = m('#46404C', 'hair'), iron = m('#6E6A78', 'metal');
      const fl = [m('#D8A8FF', 'glow', { light: '#C090FF' }), m('#A8FF8A', 'glow', { light: '#8CFF78' }), m('#9ADCFF', 'glow', { light: '#80C8FF' }), m('#FFB050', 'glow', { light: '#FF9A40' })];
      legs(k, witchD, m('#2A2228', 'leather'), {});
      arm(k, 'B', witch, skin, { bell: witch });
      // ragged black robe, wax-white shawl with drips
      const hem = -k.U(.4);
      k.add(3, 'up', witch, P(-k.sw * .82, k.shY, k.sw * .86, k.shY, k.sw, k.shY + 2 * u, k.sw * .8, k.waY, k.hipW * 1.3, k.hiY * .3, k.hipW * 1.7, hem, k.hipW, hem - 1.4, k.hipW * .4, hem, -k.hipW * .3, hem - 1.3, -k.hipW * .9, hem, -k.hipW * 1.6, hem - 1, -k.hipW * 1.3, k.hiY * .3, -k.sw * .8, k.waY, -k.sw, k.shY + 2 * u), { bev: 1.1 });
      k.add(3.6, 'up', wax, P(-k.sw * 1.12, k.shY + 2, arcPts(0, k.shY + 1.4, k.sw * 1.1, 2.6, Math.PI, Math.PI * 2, 6), k.sw * 1.15, k.shY + 2, k.sw * .9, k.shY + 4.5, k.sw * .6, k.shY + 4.2, k.sw * .5, k.shY + 7, k.sw * .25, k.shY + 4.8, -k.sw * .3, k.shY + 5, -k.sw * .45, k.shY + 6.8, -k.sw * .65, k.shY + 4.6), { bev: 1 });
      k.add(3.3, 'up', wax, R(-k.sw * .8, k.waY - k.U(.5), k.sw * 1.6, k.U(1)));
      head(k, skin); face(k, { eye: this.eye, brow: '#46404C' });
      const { hx, hy, hw, hh } = k;
      // long stringy hair over the side of the face
      hairShort(k, hair, { long: 2 });
      k.add(4.25, 'head', hair, P(hx - hw * .3, hy - hh * .6, hx + hw * .1, hy - hh * .4, hx - hw * .1, hy + hh * 1.3, hx - hw * .5, hy + hh * 1.6, hx - hw * .6, hy + hh * .5));
      // crown of dripping candles, each a different flame
      k.add(4.4, 'head', iron, R(hx - hw * 1.05, hy - hh * .7, hw * 2.1, 1));
      const cs = [[-.6, 2.4], [.05, 3.4], [.7, 2.2]];
      cs.forEach(([x, h], i) => {
        const cx = hx + hw * x;
        k.add(4.42, 'head', wax, R(cx - .7, hy - hh * .7 - h, 1.4, h), { sep: 1 });
        k.add(4.44, 'head', fl[i], Q(Math.round(cx - .5), Math.round(hy - hh * .7 - h - 1.2), 1, 1), { nl: 1, lr: 6 });
      });
      arm(k, 'F', witch, skin, { bell: witch });
      // candelabra staff (role weapon)
      const up = k.H * .66, dn = k.H * .24;
      k.held(5.9, 'F', .05, [
        [w.P, R(-.6, -up, 1.2, up + dn)],
        [w.r >= 1 ? w.R : iron, P(-3.6, -up - .6, -2.6, -up + .6, 0, -up + 1.2, 2.6, -up + .6, 3.6, -up - .6, 3, -up + 1.8, 0, -up + 2.6, -3, -up + 1.8)],
        [wax, R(-4, -up - 2.8, 1.2, 2.4)], [wax, R(-.6, -up - 3.6, 1.2, 3.2)], [wax, R(2.8, -up - 2.8, 1.2, 2.4)],
        [fl[0], Q(-4, -up - 4, 1, 1), { nl: 1, lr: 7 }], [w.G || fl[1], Q(-.5, -up - 4.8, 1, 1), { nl: 1, lr: 9, pulse: 1 }], [fl[3], Q(3, -up - 4, 1, 1), { nl: 1, lr: 7 }]
      ]);
    } };

  // ---------------- Vesper Lark, the Songweaver (Epic support) ----------------
  AK.CHARS.vesper = { name: 'Vesper', circle: 'wayfarers', hs: 1, ws: .9, aF: -.55, aB: -.4, anim: 'cast', eye: '#2A1A18',
    wpn: { fam: 'wood', fam2: 'fibre', t: 2, r: 2 },
    build(k, w) {
      const u = k.u;
      const teal = m('#2E7A74'), tealD = m('#1F5553'), gold = m('#E0AE44', 'metal'), lea = m('#5A3E2A', 'leather'), skin = m(SKINS[1], 'skin'), hair = m('#A85A2E', 'hair'), cream = m('#E8D8A8'), boot = m('#4A3428', 'leather');
      // the lute slung on her back (role weapon)
      const lx = -k.sw * 1.45, ly = k.waY + .5;
      k.add(.2, 'up', w.P, E(lx, ly + 2, 3.4, 4.2, .35), { bev: 1 });
      k.add(.22, 'up', m('#2A1A14', 'flat'), E(lx + .4, ly + 1.4, 1, 1), { nl: 1 });
      k.add(.21, 'up', w.D, P(lx - .2, ly - 2.4, lx + .9, ly - 2, lx + 5.6, ly - 13.4, lx + 4.6, ly - 13.8));
      k.add(.23, 'up', w.r >= 1 ? w.R : w.D, P(lx + 4.2, ly - 14, lx + 6.4, ly - 15.2, lx + 6.8, ly - 13.6, lx + 5.4, ly - 12.8));
      if (w.G) k.add(.24, 'up', w.G, Q(Math.round(lx - 1), Math.round(ly + 3), 1, 1), { nl: 1, lr: 7 });
      // short cape behind the shoulders
      k.add(.3, 'up', tealD, P(-k.sw * .9, k.shY - .4, k.sw * .3, k.shY, -k.sw * .2, k.shY + 5, -k.sw * 1.3, k.waY - 1, -k.sw * 1.1, k.shY + 3));
      legs(k, m('#3E3440'), boot, { tall: 1.4, cuff: gold });
      arm(k, 'B', teal, skin, { cuff: gold });
      // teal doublet with gold trim, a strap for the lute
      k.add(3, 'up', teal, torsoShape(k, { bot: k.hiY * .5, bw: 1.2 }), { bev: 1.1 });
      k.add(3.05, 'up', gold, R(k.sw * .1, k.shY + .6, k.U(1), k.hiY * .5 - k.shY - .6));
      k.add(3.2, 'up', lea, P(k.sw * .75, k.shY + .4, k.sw * .95, k.shY + 1.4, -k.sw * .7, k.waY + 1, -k.sw * .9, k.waY));
      belt(k, gold, { w: 1.4 });
      head(k, skin); face(k, { eye: this.eye, brow: '#6A2E14' });
      hairShort(k, hair, { long: 1.2 });
      const { hx, hy, hw, hh } = k;
      // feathered cap
      k.add(4.4, 'head', tealD, P(hx - hw * 1.05, hy - hh * .35, arcPts(hx, hy - hh * .4, hw * 1.1, hh * .75, Math.PI, Math.PI * 2, 8), hx + hw * 1.4, hy - hh * .3), { sep: 1, bev: .9 });
      k.add(4.42, 'head', gold, R(hx - hw * 1.05, hy - hh * .52, hw * 2.2, k.U(.9)));
      k.add(4.5, 'head', cream, P(hx - hw * .3, hy - hh * .9, hx - hw * 1.2, hy - hh * 1.9, hx - hw * 2.4, hy - hh * 2.2, hx - hw * 1.6, hy - hh * 1.5, hx - hw * 2.2, hy - hh * 1.4, hx - hw * .9, hy - hh * .7), { sep: 1, bev: .8 });
      arm(k, 'F', teal, skin, { cuff: gold });
    } };
}
