// 12f-art-wayfarers: the Wayfarers circle in B1 (Thessaly, Grenna, Morwen, Vesper). DATA only.
// Entry format: see 12c-art-hedgefolk.js. Kit and rules: 12a-art-body.js, docs/design/art-direction.md.
{
  const { m, E, P, C, R, Q, arcPts, rrect, legs, torsoShape, robeShape, arm, head, face, hairShort, hood, belt, SKINS } = AK;

  // ---------------- Thessaly Gloam, the Bog Seer (Rare caster) ----------------
  // Silhouette: stooped, a wide cone of a reed hat, a crooked staff with bottles hanging from it.
  AK.CHARS.thessaly = { name: 'Thessaly', circle: 'wayfarers', hs: 1, ws: .86, aF: -.3, aB: -.1, anim: 'cast', eye: '#141A10', pose: { lean: .16, hb: .7 },
    wpn: { fam: 'wood', fam2: 'crystal', t: 2, r: 1 },
    build(k, w) {
      const u = k.u, { hx, hy, hw, hh } = k;
      const murk = m('#4E6236'), shawl = m('#5E7A78'), reed = m('#B8A462'), reedD = m('#7A6A3E'), cord = m('#6A4E34', 'leather'), skin = m(SKINS[1], 'skin'), hair = m('#A8A898', 'hair'),
        bog = m('#B8F08A', 'glow', { light: '#A0E678' }), string = m('#D8CCA8', 'flat'), cork = m('#8A6040', 'flat');
      legs(k, m('#3A3A30'), m('#3E3428', 'leather'), {});
      arm(k, 'B', murk, skin, { bell: murk });
      // ragged floor-length robe with a grey-teal hem, grey-teal shawl, cord belt and a gourd
      const hem = -k.U(.4);
      const rb = k.add(3, 'up', murk, P(-k.sw * .82, k.shY, k.sw * .86, k.shY, k.sw, k.shY + 2 * u, k.sw * .8, k.waY, k.hipW * 1.3, k.hiY * .3, k.hipW * 1.65, hem, k.hipW * .9, hem - 1.2, k.hipW * .3, hem, -k.hipW * .4, hem - 1.3, -k.hipW * 1.1, hem, -k.hipW * 1.55, hem - 1, -k.hipW * 1.3, k.hiY * .3, -k.sw * .8, k.waY, -k.sw, k.shY + 2 * u), { bev: 1.2 });
      k.add(3.02, 'up', shawl, R(-20, hem - 3, 40, 1.4), { clip: rb, sep: 1 });
      k.add(3.6, 'up', shawl, P(-k.sw * 1.12, k.shY + 2, arcPts(0, k.shY + 1.4, k.sw * 1.1, 2.6, Math.PI, Math.PI * 2, 6), k.sw * 1.15, k.shY + 2, k.sw * .7, k.shY + 5, k.sw * .45, k.shY + 4.4, k.sw * .1, k.shY + 7.5, -k.sw * .3, k.shY + 5, -k.sw * .65, k.shY + 6), { bev: 1 });
      k.add(3.3, 'up', cord, R(-k.sw * .82, k.waY - k.U(.6), k.sw * 1.64, k.U(1.2)));
      k.add(3.4, 'up', reedD, E(k.sw * .35, k.waY + 2.4, 1.5, 1.9));
      k.add(3.41, 'up', cork, Q(Math.round(k.sw * .35 - .5), Math.round(k.waY + .2), 1, 1), { nl: 1 });
      head(k, skin); face(k, { eye: this.eye, brow: '#5A5A4A' });
      hairShort(k, hair, { long: 1.6 });
      // wide reed hat: a shallow cone well past the shoulders, with a darker woven band
      const brim = k.add(4.5, 'head', reed, P(hx - hw * 2.2, hy - hh * .35, hx - hw * .6, hy - hh * .85, hx + hw * 1.1, hy - hh * .85, hx + hw * 2.5, hy - hh * .4, hx + hw * 2.3, hy - hh * .2, hx - hw * 2, hy - hh * .15), { bev: .8, sep: 1 });
      const cr = k.add(4.52, 'head', reed, P(hx - hw * 1.25, hy - hh * .7, hx + hw * 1.55, hy - hh * .7, hx + hw * .4, hy - hh * 1.75, hx + hw * .05, hy - hh * 1.85), { bev: 1, sep: 1 });
      k.add(4.53, 'head', reedD, R(hx - hw * 2, hy - hh * 1.02, hw * 4, k.U(1.1)), { clip: cr });
      k.add(4.51, 'head', reedD, R(hx - hw * 3, hy - hh * .45, hw * 6, k.U(.9)), { clip: brim, nl: 1 });
      arm(k, 'F', murk, skin, { bell: murk, bellTrim: shawl });
      // crooked staff hung with little bottles on strings (role weapon: the wood and the gem show the tier)
      const up = k.H * .76, dn = k.H * .3;
      k.held(5.9, 'F', .1, [
        [w.P, R(-.6, -up, 1.2, up + dn)],
        [w.P, P(-.6, -up, -1.4, -up - 1.8, .4, -up - 3, 2, -up - 2.2, 8.6, -up - 2.2, 8.6, -up - 1, 1, -up - 1, .6, -up + .8)],
        [string, R(1.6, -up - 1.1, .5, 2.2), { nl: 1 }],
        [w.r >= 2 ? w.C : m('#8ACCD8', 'gem'), rrect(.7, -up + .8, 2.3, 2.8, .7)],
        [cork, R(1.4, -up + .3, 1, .8), { nl: 1 }],
        [string, R(4.4, -up - 1.1, .5, 4.2), { nl: 1 }],
        [m('#C8803A', 'gem'), rrect(3.5, -up + 2.8, 2.3, 2.6, .6)],
        [cork, R(4.2, -up + 2.3, 1, .8), { nl: 1 }],
        [string, R(7.5, -up - 1.1, .5, 1.6), { nl: 1 }],
        [bog, rrect(6.5, -up + .3, 2.5, 3.2, .8), { lr: 10, pulse: 1 }],
        w.r >= 1 ? [w.R, R(-1, -up + 7, 2, 1.2)] : null
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
  // Silhouette: hunched, a crown of tall dripping candles with coloured flames, a candelabra staff.
  AK.CHARS.morwen = { name: 'Morwen', circle: 'wayfarers', hs: .98, ws: .96, aF: -.3, aB: -.2, anim: 'cast', eye: '#1E121E', pose: { lean: .18, hb: .7 },
    wpn: { fam: 'wood', fam2: 'ore', t: 2, r: 2 },
    build(k, w) {
      const u = k.u, { hx, hy, hw, hh } = k;
      const witch = m('#2C2432'), witchD = m('#1C1622'), tallow = m('#978A72'), wax = m('#D8CAA6'), plum = m('#5A3452'), skin = m('#E2C2A4', 'skin'), hair = m('#3A3444', 'hair'), iron = m('#6E6A78', 'metal');
      const fl = [m('#D8A8FF', 'glow', { light: '#C090FF' }), m('#A8FF8A', 'glow', { light: '#8CFF78' }), m('#9ADCFF', 'glow', { light: '#80C8FF' }), m('#FFB050', 'glow', { light: '#FF9A40' }), m('#FF8AB0', 'glow', { light: '#FF7098' })];
      legs(k, witchD, m('#2A2228', 'leather'), {});
      arm(k, 'B', witch, skin, { bell: witch, bellTrim: plum });
      // ragged black robe with a plum hem, a hump of tallow shawl with wax drips
      const hem = -k.U(.4);
      const rb = k.add(3, 'up', witch, P(-k.sw * .82, k.shY, k.sw * .86, k.shY, k.sw, k.shY + 2 * u, k.sw * .8, k.waY, k.hipW * 1.3, k.hiY * .3, k.hipW * 1.7, hem, k.hipW, hem - 1.4, k.hipW * .4, hem, -k.hipW * .3, hem - 1.3, -k.hipW * .9, hem, -k.hipW * 1.6, hem - 1, -k.hipW * 1.3, k.hiY * .3, -k.sw * .8, k.waY, -k.sw, k.shY + 2 * u), { bev: 1.1 });
      k.add(3.02, 'up', plum, R(-20, hem - 2.8, 40, 1.3), { clip: rb, sep: 1 });
      k.add(3.6, 'up', tallow, P(-k.sw * 1.25, k.shY + 2.5, -k.sw * 1.1, k.shY - .6, -k.sw * .3, k.shY - 1.3, k.sw * .6, k.shY - .6, k.sw * 1.15, k.shY + 1.8, k.sw * .9, k.shY + 4.5, k.sw * .65, k.shY + 4, k.sw * .55, k.shY + 6.6, k.sw * .3, k.shY + 4.6, -k.sw * .3, k.shY + 5, -k.sw * .5, k.shY + 7, -k.sw * .7, k.shY + 4.8, -k.sw * 1.05, k.shY + 5.4), { bev: 1.1 });
      k.add(3.3, 'up', plum, R(-k.sw * .8, k.waY - k.U(.6), k.sw * 1.6, k.U(1.2)));
      k.add(3.35, 'up', wax, R(k.sw * .25, k.waY + .4, 1.2, 2.6));
      k.add(3.36, 'up', fl[3], Q(Math.round(k.sw * .25), Math.round(k.waY - .8), 1, 1), { nl: 1, lr: 5 });
      head(k, skin); face(k, { eye: this.eye, brow: '#3A3440' });
      // long stringy hair: down the back and one lock beside the face
      hairShort(k, hair, { long: 2.1 });
      k.add(4.25, 'head', hair, P(hx - hw * 1.05, hy - hh * .5, hx - hw * .6, hy - hh * .3, hx - hw * .55, hy + hh * 1.4, hx - hw * .85, hy + hh * 1.8, hx - hw * 1.2, hy + hh * .6));
      // crown of dripping candles: an iron band, five candles, each flame a different colour
      const by = hy - hh * .75;
      k.add(4.4, 'head', iron, R(hx - hw * 1.1, by, hw * 2.2, k.U(1.4)));
      const cs = [[-.8, 3], [-.15, 4.8], [.5, 3.8], [1.1, 2.6]], fi = [0, 1, 2, 4];
      cs.forEach(([x, h], i) => {
        const cx = hx + hw * x;
        k.add(4.42 + i * .002, 'head', wax, R(cx - .65, by - h, 1.3, h + .2), { sep: 1 });
        k.add(4.43 + i * .002, 'head', wax, Q(Math.round(cx + (i % 2 ? .1 : -.9)), Math.round(by + 1), 1, 1 + (i % 2)), { nl: 1 });
        k.add(4.44, 'head', fl[fi[i]], P(cx, by - h - 2.4, cx + .7, by - h - .8, cx, by - h + .1, cx - .7, by - h - .8), { nl: 1, lr: 6 });
      });
      arm(k, 'F', witch, skin, { bell: witch, bellTrim: plum });
      // candelabra staff (role weapon): shaft in the tier's wood, arms in the tier's ore
      const up = k.H * .84, dn = k.H * .24;
      k.held(5.9, 'F', .14, [
        [w.P, R(-.6, -up, 1.2, up + dn)],
        [w.r >= 1 ? w.R : iron, P(-3.8, -up - .8, -2.8, -up + .6, 0, -up + 1.2, 2.8, -up + .6, 3.8, -up - .8, 3.2, -up + 1.9, 0, -up + 2.7, -3.2, -up + 1.9)],
        [wax, R(-4.4, -up - 3.2, 1.4, 2.8)], [wax, R(-.7, -up - 4, 1.4, 3.6)], [wax, R(3, -up - 3.2, 1.4, 2.8)],
        [fl[0], P(-3.7, -up - 5.4, -3.1, -up - 4, -3.7, -up - 3.1, -4.3, -up - 4), { nl: 1, lr: 7 }],
        [w.G || fl[1], P(0, -up - 6.4, .7, -up - 4.8, 0, -up - 3.9, -.7, -up - 4.8), { nl: 1, lr: 9, pulse: 1 }],
        [fl[3], P(3.7, -up - 5.4, 4.3, -up - 4, 3.7, -up - 3.1, 3.1, -up - 4), { nl: 1, lr: 7 }]
      ]);
    } };

  // ---------------- Vesper Lark, the Songweaver (Epic support) ----------------
  // Silhouette: a feathered cap with a long plume, a short cape, a round-bodied lute slung across her front.
  AK.CHARS.vesper = { name: 'Vesper', circle: 'wayfarers', hs: 1, ws: .9, aF: -.55, aB: -.4, anim: 'cast', eye: '#2A1A18',
    wpn: { fam: 'wood', fam2: 'fibre', t: 2, r: 2 },
    build(k, w) {
      const u = k.u, { hx, hy, hw, hh } = k;
      const teal = m('#2E7A74'), tealD = m('#1E5450'), gold = m('#E0AE44', 'metal'), lea = m('#5A3E2A', 'leather'), skin = m(SKINS[1], 'skin'), hair = m('#A85A2E', 'hair'),
        cream = m('#E6D4A4'), plume = m('#F0E6C8'), boot = m('#4A3428', 'leather'), dark = m('#1E1210', 'flat'), str = m('#EDE4CC', 'flat');
      // short cape behind the shoulders with a gold hem
      const cp = k.add(.3, 'up', tealD, P(-k.sw * .9, k.shY - .6, k.sw * .3, k.shY, -k.sw * .1, k.waY - 1, -k.sw * .9, k.waY + 1.2, -k.sw * 1.55, k.waY - .2, -k.sw * 1.35, k.shY + 3));
      k.add(.32, 'up', gold, P(-k.sw * 2, k.waY - 1.2, 0, k.waY - 2.4, 0, k.waY + 3, -k.sw * 2, k.waY + 3), { clip: cp });
      legs(k, m('#3E3440'), boot, { tall: 1.4, cuff: gold });
      arm(k, 'B', cream, skin, { cuff: gold });
      // teal doublet with a gold placket over cream shirt sleeves, a strap for the lute
      k.add(3, 'up', teal, torsoShape(k, { bot: k.hiY * .5, bw: 1.2 }), { bev: 1.1 });
      k.add(3.05, 'up', gold, R(k.sw * .1, k.shY + .6, k.U(1), k.hiY * .5 - k.shY - .6));
      belt(k, lea, { w: 1.6, buckle: gold });
      head(k, skin); face(k, { eye: this.eye, brow: '#6A2E14', mouth: '#8A3A2A' });
      hairShort(k, hair, { long: 1.25 });
      // feathered cap: a peaked teal cap with a gold band and a long cream plume sweeping back
      k.add(4.5, 'head', plume, P(hx - hw * .2, hy - hh * .95, hx - hw * 1, hy - hh * 1.85, hx - hw * 2.3, hy - hh * 2.3, hx - hw * 1.8, hy - hh * 1.75, hx - hw * 2.5, hy - hh * 1.55, hx - hw * 1.5, hy - hh * 1.2, hx - hw * 1.9, hy - hh * .95, hx - hw * .8, hy - hh * .7), { sep: 1, bev: .8 });
      const cap = k.add(4.4, 'head', tealD, P(hx - hw * 1.15, hy - hh * .3, arcPts(hx + hw * .05, hy - hh * .4, hw * 1.15, hh * .85, Math.PI, Math.PI * 1.75, 7), hx + hw * 1.1, hy - hh * 1.05, hx + hw * 1.75, hy - hh * .45, hx + hw * 1.2, hy - hh * .3), { sep: 1, bev: .9 });
      k.add(4.42, 'head', gold, R(hx - hw * 1.3, hy - hh * .55, hw * 3.2, k.U(1)), { clip: cap });
      // the lute (role weapon), slung across her front: round body in the tier's wood, a dark sound hole,
      // strings, a neck angled up behind her shoulder and a bent-back peg box
      const bx = k.sw * .35, by = k.waY + 1.6, ang = -.55;
      const rot = (x, y) => [bx + x * Math.cos(ang) - y * Math.sin(ang), by + x * Math.sin(ang) + y * Math.cos(ang)];
      const rp = (...xy) => { const o = []; for (let i = 0; i < xy.length; i += 2) o.push(...rot(xy[i], xy[i + 1])); return P(o); };
      k.add(5, 'up', w.P, rp(-1, -3.4, 1, -3.4, 1.1, -12.5, -1.1, -12.5), { bev: .6 });
      k.add(5.02, 'up', w.r >= 1 ? w.R : w.D, rp(-1.2, -12.4, 1.2, -12.4, 2, -14.2, .4, -15.4, -1.2, -13.6));
      const body = k.add(5.05, 'up', w.P, E(bx, by, 3.8, 4.6, ang), { bev: 1 });
      k.add(5.055, 'up', m(AK.mix(w.P.hex, '#F2D8A0', .5), 'wood'), E(...rot(-.3, -.3), 3, 3.8, ang), { clip: body, sep: 1 });
      k.add(5.06, 'up', w.D, rp(-4, 3.2, 4, 3.2, 4, 5, -4, 5), { clip: body, nl: 1 });
      k.add(5.07, 'up', dark, E(...rot(0, -.8), 1.1, 1.1), { nl: 1 });
      k.add(5.08, 'up', w.r >= 1 ? w.R : lea, rp(-1.5, 2, 1.5, 2, 1.5, 2.9, -1.5, 2.9), { nl: 1 });
      k.add(5.09, 'up', w.G || str, rp(-.2, -12.2, .2, -12.2, .2, 2.2, -.2, 2.2), w.G ? { nl: 1, lr: 6 } : { nl: 1 });
      arm(k, 'F', cream, skin, { cuff: gold });
    } };
}
