// 12c-art-hedgefolk: the Hedgefolk circle in B1 (Tobin, Wren, Hesketh, Pip, Bram). DATA only.
// Each entry: { name, circle, hs, ws, hd?, armW?, handS?, aF, aB, anim, pose?, wpn: { fam, fam2?, t, r, glow? }, build(k, w) }.
// w = the role weapon's gear material set (tier and rarity from the character's weapon, see AK.gearMats).
// Kit and rules: 12a-art-body.js, docs/design/art-direction.md.
{
  const { m, E, P, C, R, Q, arcPts, rrect, legs, torsoShape, robeShape, arm, head, face, hairShort, hairFringe, beard, hood, belt, lanternItems, SKINS } = AK;

  // ---------------- Tobin Reed, the Hedge Squire (Common tank) ----------------
  AK.CHARS.tobin = { name: 'Tobin', circle: 'hedgefolk', hs: .82, ws: 1.14, aF: -.3, aB: -.55, anim: 'slash', eye: '#2E2018',
    wpn: { fam: 'ore', fam2: 'hide', t: 2, r: 0 },
    build(k, w) {
      const u = k.u;
      const moss = m('#6E8C3C'), mossD = m('#4C6430'), lea = m('#7C5232', 'leather'), dlea = m('#523622', 'leather'), tr = m('#5A4232'), boot = m('#6A4630', 'leather'), iron = m('#8C909C', 'metal'), wood = m('#A06C3C', 'wood'), skin = m(SKINS[0], 'skin'), hair = m('#C0642E', 'hair'), tan = m('#C8A070');
      legs(k, tr, boot, { cuff: dlea, patch: tan });
      arm(k, 'B', moss, lea, { cuff: dlea, big: 1.12 });
      const gb = k.add(3, 'up', moss, torsoShape(k, { bot: k.hiY * .55, bw: 1.35, ww: .95 }), { bev: 1.3 });
      k.add(3.03, 'up', mossD, R(-20, k.hiY * .55 - k.U(1.3), 40, k.U(1.3)), { clip: gb, nl: 1 });
      // belt, baldric strap, pouch
      k.add(3.3, 'up', lea, R(-k.sw, k.waY - k.U(1), k.sw * 2, k.U(2.2)));
      k.add(3.32, 'up', iron, R(k.sw * .15, k.waY - k.U(1), k.U(1.8), k.U(2.2)));
      k.add(3.35, 'up', dlea, P(k.sw * .55, k.shY + .5 * u, k.sw * .9, k.shY + 1.2 * u, -k.sw * .6, k.waY + .2 * u, -k.sw * .95, k.waY - .8 * u));
      k.add(3.4, 'up', lea, rrect(-k.hipW * 1.25, k.waY + k.U(1), k.U(3.4), k.U(3.4), k.U(1)));
      head(k, skin); face(k, { eye: this.eye, brow: '#8A3A1A', browUp: 1 });
      const { hx, hy, hw, hh } = k;
      // ginger tufts under the helm
      k.add(4.15, 'head', hair, P(hx - hw * 1.05, hy - hh * .3, hx - hw * .2, hy - hh * .45, hx - hw * .45, hy + hh * .35, hx - hw * .8, hy + hh * .2, hx - hw * 1.2, hy + hh * .5, hx - hw * 1.1, hy + hh * .05));
      k.add(4.16, 'head', hair, P(hx + hw * .2, hy - hh * .5, hx + hw * .9, hy - hh * .45, hx + hw * .55, hy - hh * .12, hx + hw * .35, hy - hh * .28));
      // oversized pot helm: dome and a wide brim
      k.add(4.3, 'head', iron, P(arcPts(hx - hw * .05, hy - hh * .38, hw * 1.02, hh * .95, Math.PI, Math.PI * 2, 12)), { bev: 1.3 });
      k.add(4.35, 'head', iron, E(hx + hw * .02, hy - hh * .38, hw * 1.42, Math.max(1.2, hh * .2)), { sep: 1 });
      // dented buckler on the back arm
      const br = k.H * .16, bcx = k.hB[0] + .5 * u, bcy = k.hB[1] - br * .3;
      k.add(5, 'armB', iron, E(bcx, bcy, br, br));
      k.add(5.1, 'armB', wood, E(bcx, bcy, br - k.U(1.3), br - k.U(1.3)), { sep: 1 });
      k.add(5.2, 'armB', iron, E(bcx, bcy, br * .35, br * .35), { sep: 1 });
      // front arm and the borrowed sword that is too big for him
      arm(k, 'F', moss, lea, { cuff: dlea, big: 1.12 });
      const bl = k.H * .62, bw = 1.2;
      k.held(7, 'F', .4, [
        [dlea, R(-k.U(.8), -k.U(3), k.U(1.6), k.U(6))],
        [w.r >= 1 ? w.R : iron, E(0, k.U(3.4), k.U(1.2), k.U(1.2))],
        [w.r >= 1 ? w.R : iron, R(-k.U(3), -k.handR - k.U(1.6), k.U(6), k.U(1.4))],
        [w.P, P(-bw, -k.handR - k.U(1.6), bw, -k.handR - k.U(1.6), bw * .9, -bl + bw * 1.5, 0, -bl, -bw * .9, -bl + bw * 1.5), { bev: .6 }],
        w.G ? [w.G, R(-.4, -bl + 3, .8, bl * .5), { nl: 1, lr: 8 }] : null
      ]);
      k.add(6.4, 'armF', mossD, E(k.pF[0] + .2 * u, k.pF[1], k.armR * 1.45, k.armR * 1.2), { g: 'q' });
    } };

  // ---------------- Wren Hollowmere, the Batwing Archer (Common striker, ranged) ----------------
  // Slim and hooded: a bat-eared hood, a long bat-violet scarf streaming behind, a leather jerkin
  // over the green tunic, a quiver over the back shoulder and a longbow taller than she is.
  AK.CHARS.wren = { name: 'Wren', circle: 'hedgefolk', hs: .98, ws: .88, aF: -.15, aB: -.85, anim: 'shoot', eye: '#2A1C18',
    wpn: { fam: 'wood', fam2: 'hide', t: 1, r: 1 },
    build(k, w) {
      const u = k.u, po = k.pose;
      const green = m('#3E7A48'), greenD = m('#2E5A38'), hoodM = m('#2A4E36'), violet = m('#8C5ACA'), violetD = m('#643E9E'), lea = m('#946442', 'leather'), dlea = m('#4A3020', 'leather'), tr = m('#3A3446'), boot = m('#4A3226', 'leather'), skin = m(SKINS[1], 'skin'), hair = m('#2A1C18', 'hair'), fl = m('#E8E0D0'), brass = m('#C8A868', 'metal');
      const { hx, hy, hw, hh, sw } = k;
      // the scarf: two tails streaming behind, cut like a bat's wing at the ends
      k.add(.15, 'up', violetD, P(-sw * .2, k.shY, -sw * .9, k.shY + 2.4, -sw * 1.7, k.shY + 4.2, -sw * 2.35, k.shY + 4.6, -sw * 2.05, k.shY + 5.6, -sw * 2.3, k.shY + 6.8, -sw * 1.6, k.shY + 6, -sw * .8, k.shY + 3.4), { bev: .7 });
      k.add(.2, 'up', violet, P(-sw * .1, k.shY + .6, -sw * .2, k.shY + 2, -sw * 1, k.waY - 1, -sw * 1.6, k.waY + 2.6, -sw * 1.9, k.waY + 5, -sw * 1.55, k.waY + 4, -sw * 1.3, k.waY + 5.2, -sw * 1.05, k.waY + 3.8, -sw * .75, k.waY + 4.6, -sw * .6, k.waY + 1, -sw * .15, k.shY + 3), { bev: .8 });
      // quiver over the back shoulder, fletchings above it
      const q0 = [-sw * 1.45, k.shY - 2.6], q1 = [-sw * .2, k.waY + .6];
      for (const [dx, mat] of [[-1.3, fl], [0, violet], [1.2, fl]]) k.add(.4, 'up', mat, P(q0[0] + dx - .9, q0[1] + .6, q0[0] + dx - 1.6, q0[1] - 2.6, q0[0] + dx + .1, q0[1] - 3.6, q0[0] + dx + .6, q0[1] + .6), { sep: 1 });
      const qv = k.add(.5, 'up', lea, C(q0[0], q0[1], 1.9, q1[0], q1[1], 1.6), { bev: .8 });
      k.add(.52, 'up', dlea, C(q0[0], q0[1], 2.1, q0[0] + .9, q0[1] + 1.4, 2), { clip: qv });
      legs(k, tr, boot, { cuff: dlea, tall: 1.25 });
      arm(k, 'B', green, dlea, { bracer: lea });
      // green tunic, a leather jerkin laced up the front, belt and quiver strap
      const tu = k.add(3, 'up', green, torsoShape(k, { bot: k.hiY * .62, bw: 1.25 }), { bev: 1.1 });
      k.add(3.02, 'up', greenD, R(-20, k.hiY * .62 - k.U(1.3), 40, k.U(1.3)), { clip: tu, nl: 1 });
      const jk = k.add(3.1, 'up', lea, P(-sw * .82, k.shY + 1.2 * u, sw * .8, k.shY + 1.2 * u, sw * .82, k.waY + 1.2, -sw * .84, k.waY + 1.2), { bev: 1 });
      k.add(3.12, 'up', dlea, R(sw * .18, k.shY + 1.2 * u, k.U(.9), 20), { clip: jk, nl: 1 });
      belt(k, dlea, { buckle: brass, w: 1.9 });
      k.add(3.35, 'up', dlea, P(sw * .55, k.shY + .2, sw * .95, k.shY + 1, -sw * .7, k.waY - .2, -sw * .95, k.waY - 1.3));
      head(k, skin); face(k, { eye: this.eye });
      hairShort(k, hair);
      // hood with two bat ears, the scarf wrapped at the neck
      k.add(4.28, 'head', hoodM, P(hx - hw * 1.12, hy - hh * .85, hx - hw * 1.05, hy - hh * 1.85, hx - hw * .4, hy - hh * 1.15), { bev: .6 });
      k.add(4.28, 'head', hoodM, P(hx - hw * .15, hy - hh * 1.2, hx + hw * .45, hy - hh * 1.95, hx + hw * .6, hy - hh * .95), { bev: .6 });
      hood(k, hoodM, {});
      k.add(4.35, 'up', violet, E(hx - .3, k.shY + .3, sw * .78, k.U(2)), { sep: 1 });
      k.add(4.36, 'up', violetD, P(hx + sw * .1, k.shY + 1, hx + sw * .55, k.shY + 1, hx + sw * .5, k.shY + 4, hx + sw * .15, k.shY + 3.6));
      arm(k, 'F', green, dlea, { bracer: lea });
      // recurve longbow, taller than her (tier on the limbs, gold nocks from Rare, glow from Epic)
      const bh = k.H * .54, dr = !!po.drawn, pull = dr ? 5 : 0;
      const items = [
        [w.P, P(-.9, -1.2, .9, -1.2, 3.8, -bh * .42, 3.4, -bh * .85, 1.9, -bh - .6, .6, -bh - .2, 2, -bh * .82, 2.3, -bh * .44, -.9, -2)],
        [w.P, P(-.9, 1.2, .9, 1.2, 3.8, bh * .42, 3.4, bh * .85, 1.9, bh + .6, .6, bh + .2, 2, bh * .82, 2.3, bh * .44, -.9, 2)],
        [w.Q, R(-1.2, -2.2, 2.4, 4.4)]
      ];
      if (w.r >= 1) items.push([w.R, Q(1, -Math.round(bh) - 1, 2, 1)], [w.R, Q(1, Math.round(bh), 2, 1)]);
      if (w.G) items.push([w.G, R(2.6, -bh * .75, .8, bh * .3), { nl: 1, lr: 7 }], [w.G, R(2.6, bh * .45, .8, bh * .3), { nl: 1, lr: 7 }]);
      const str = m('#EDE4CE', 'flat');
      if (!dr) items.push([str, R(.9, -bh + .2, .6, bh * 2 - .4), { nl: 1 }]);
      else items.push([str, P(.9, -bh + .2, 1.5, -bh + .2, -pull + .6, .3, -pull, .3), { nl: 1 }], [str, P(-pull, -.3, -pull + .6, -.3, 1.5, bh - .2, .9, bh - .2), { nl: 1 }],
        [m('#8A6038', 'wood'), R(-pull, -.5, pull + 8, 1)], [violet, P(-pull - 1, -1.4, -pull + 1.6, -.5, -pull + 1.6, .5, -pull - 1, 1.4)], [m('#C8CCD4', 'metal'), P(7.6, -1.3, 9.6, 0, 7.6, 1.3)]);
      k.held(5.5, 'B', 0, items);
    } };

  // ---------------- Old Hesketh, the Lamplighter (Common support) ----------------
  // Stooped old man: flat cap, white beard, soot-grey greatcoat with a shoulder cape, an amber scarf
  // streaming behind, a lit lamp at his hip and a tall lighting pole with a brass crook and flame.
  AK.CHARS.hesketh = { name: 'Hesketh', circle: 'hedgefolk', hs: .96, ws: 1, aF: -.55, aB: -.2, anim: 'cast', eye: '#3A2A22', pose: { lean: .1, hb: .6 },
    wpn: { fam: 'wood', fam2: 'ore', t: 1, r: 0 },
    build(k, w) {
      const u = k.u;
      const coat = m('#6C6676'), coatD = m('#4A4654'), cape = m('#4C4858'), amber = m('#EAA23E'), lea = m('#7A5438', 'leather'), dlea = m('#4A3224', 'leather'), boot = m('#3E302A', 'leather'), skin = m(SKINS[0], 'skin'), white = m('#DCD6CC', 'hair'), brass = m('#CFA24C', 'metal'), soot = m('#2E2A32', 'metal');
      const { hx, hy, hw, hh, sw } = k;
      // scarf tail blowing out behind the neck
      k.add(.3, 'up', amber, P(-sw * .2, k.shY - .4, -sw * .3, k.shY + 1.6, -sw * 1.2, k.shY + 3.4, -sw * 1.75, k.shY + 3, -sw * 1.55, k.shY + 4.4, -sw * 1.95, k.shY + 4.9, -sw * 1.3, k.shY + 5.2, -sw * .5, k.shY + 3.4), { bev: .7 });
      legs(k, m('#403A46'), boot, { cuff: dlea });
      arm(k, 'B', coat, lea, { cuff: coatD, big: 1.05 });
      // long greatcoat to the shins: darker front edge and hem, brass buttons
      const hem = -k.bootH * 1.1;
      const ct = k.add(3, 'up', coat, robeShape(k, { hem, flare: .9 }), { bev: 1.2 });
      k.add(3.04, 'up', coatD, P(sw * .12, k.shY + .5, sw * .5, k.shY + .5, k.hipW * .78, hem, k.hipW * .32, hem), { clip: ct });
      k.add(3.04, 'up', coatD, R(-20, hem - k.U(1.3), 40, k.U(1.3)), { clip: ct, nl: 1 });
      for (const y of [k.shY + 4.2, k.waY + 2.4, k.waY + 5]) k.add(3.06, 'up', brass, Q(Math.round(sw * .1), Math.round(y), 1, 1), { nl: 1 });
      belt(k, dlea, { buckle: brass, w: 2 });
      // lit lamp hung at the back hip
      const lx = -k.hipW * 1.35, ly = k.waY + k.U(1.4), ls = k.U(3.2);
      k.add(3.4, 'up', brass, P(lx - ls * .6, ly + ls * .35, lx + ls * .6, ly + ls * .35, lx + ls * .35, ly, lx - ls * .35, ly));
      k.add(3.42, 'up', m('#FFD27A', 'glow', { light: '#FFC070' }), R(lx - ls * .45, ly + ls * .35, ls * .9, ls * 1.05), { lr: 14, pulse: 1 });
      k.add(3.44, 'up', brass, R(lx - ls * .6, ly + ls * 1.4, ls * 1.2, k.U(1.2)));
      // shoulder cape over the coat, the scarf wrapped at the neck with a tail down the front
      k.add(3.6, 'up', cape, P(-sw * 1.18, k.shY + (k.waY - k.shY) * .56, arcPts(0, k.shY + 1.4 * u, sw * 1.14, 2.8 * u, Math.PI, Math.PI * 2, 6), sw * 1.16, k.shY + (k.waY - k.shY) * .5), { bev: 1.1 });
      k.add(3.8, 'up', amber, E(hx - .2, k.shY + .5, sw * .66, k.U(1.9)), { sep: 1 });
      k.add(3.82, 'up', amber, P(sw * .3, k.shY + 1, sw * .66, k.shY + 1, sw * .62, k.shY + 7.4, sw * .42, k.shY + 6.8, sw * .24, k.shY + 7.4), { sep: 1 });
      head(k, skin); face(k, { eye: this.eye, brow: '#C8C0B4' });
      hairFringe(k, white);
      beard(k, white, { long: 1.3 });
      // flat cap with a short peak
      k.add(4.5, 'head', coatD, P(arcPts(hx - hw * .1, hy - hh * .42, hw * 1.08, hh * .72, Math.PI, Math.PI * 2, 10), hx + hw * 1.5, hy - hh * .34, hx + hw * 1.35, hy - hh * .1, hx - hw * 1.12, hy - hh * .3), { sep: 1, bev: 1 });
      k.add(4.52, 'head', soot, P(hx + hw * .55, hy - hh * .42, hx + hw * 1.55, hy - hh * .36, hx + hw * 1.4, hy - hh * .08, hx + hw * .5, hy - hh * .2), { sep: 1 });
      arm(k, 'F', coat, lea, { cuff: coatD, big: 1.05 });
      // the lighting pole: a brass crook at the top with a small flame in a cup
      const up = k.H * .95, dn = k.H * .08;
      const hook = w.r >= 1 ? w.R : brass;
      k.held(5.9, 'F', .08, [
        [w.P, R(-.8, -up, 1.6, up + dn), { bev: .6 }],
        [hook, R(-1, -up * .55, 2, 1.2)],
        [hook, P(-.9, -up + .4, -.6, -up - 1.4, 1.2, -up - 2.4, 3.6, -up - 2, 4.4, -up - .4, 3.4, -up - .2, 3, -up - 1, 1.3, -up - 1.1, .7, -up + .4)],
        [hook, R(3, -up - .4, 1.3, 2.4)],
        [soot, P(2, -up + 2, 5.2, -up + 2, 4.6, -up + 3.4, 2.6, -up + 3.4)],
        [m('#FFE08A', 'glow', { light: '#FFB060' }), P(2.6, -up + 2.1, 4.6, -up + 2.1, 4.2, -up + .6, 3.6, -up - .1, 3, -up + .8), { lr: 16, pulse: 1 }],
        w.G ? [w.G, Q(0, -up * .6, 1, 1), { nl: 1, lr: 7 }] : null
      ]);
    } };

  // ---------------- Pip Cinderly, the Hedge Mage (Common caster) ----------------
  // Small, a wild shock of ginger hair under a bent witch hat, a patched purple robe with an ember
  // sash, a big singed spellbook on a strap at her hip and a charred staff with an ember.
  AK.CHARS.pip = { name: 'Pip', circle: 'hedgefolk', hs: .84, ws: .98, hd: 1.06, aF: -.35, aB: -.1, anim: 'cast', eye: '#2A1A22',
    wpn: { fam: 'wood', fam2: 'crystal', t: 1, r: 0 },
    build(k, w) {
      const u = k.u;
      const robe = m('#6A3E92'), hat = m('#4C3070'), patch = m('#C08A48'), patch2 = m('#6E8E4E'), ember = m('#E8742E'), emberD = m('#B04A22'), lea = m('#6E4A30', 'leather'), dlea = m('#4A3020', 'leather'), skin = m(SKINS[0], 'skin'), hair = m('#D8602A', 'hair'), page = m('#EFE6D0'), charc = m('#2E2426'), book = m('#8C3E2A', 'leather');
      const { hx, hy, hw, hh, sw } = k;
      legs(k, m('#3E3044'), lea, { cuff: dlea });
      arm(k, 'B', robe, skin, { bell: robe, bellTrim: ember });
      // patched robe to the knee with an ember hem
      const hem = -k.bootH * 1.4;
      const rb = k.add(3, 'up', robe, robeShape(k, { hem, flare: .95 }), { bev: 1.2 });
      k.add(3.04, 'up', patch, R(-k.hipW * .95, k.hiY * .55, k.U(2.6), k.U(2.6)), { clip: rb });
      k.add(3.04, 'up', patch2, R(k.hipW * .45, hem - k.U(4.4), k.U(2.4), k.U(2.2)), { clip: rb });
      k.add(3.04, 'up', ember, R(-20, hem - k.U(1.4), 40, k.U(1.4)), { clip: rb });
      // ember sash with a knot tail
      k.add(3.3, 'up', ember, R(-sw * .85, k.waY - k.U(1), sw * 1.7, k.U(2.1)));
      k.add(3.32, 'up', emberD, P(sw * .38, k.waY + k.U(.8), sw * .68, k.waY + k.U(.8), sw * .85, k.waY + k.U(6), sw * .45, k.waY + k.U(5.4)), { sep: 1 });
      // book strap across the chest, the singed book hanging at her back hip
      k.add(3.35, 'up', dlea, P(sw * .55, k.shY + .2, sw * .9, k.shY + .9, -sw * .75, k.waY + 1.6, -sw * 1, k.waY + .6));
      const bx = -k.hipW * 1.9, by = k.waY + k.U(.6), bw = k.U(5.2), bhh = k.U(6);
      k.add(3.38, 'up', page, R(bx + k.U(.6), by + k.U(.6), bw, bhh - k.U(.4)));
      const bk = k.add(3.4, 'up', book, rrect(bx, by, bw, bhh, k.U(.6)), { bev: .8 });
      k.add(3.42, 'up', charc, P(bx - 1, by - 1, bx + bw * .55, by - 1, bx + bw * .3, by + bhh * .2, bx + bw * .1, by + bhh * .45, bx - 1, by + bhh * .5), { clip: bk, nl: 1 });
      k.add(3.43, 'up', m('#FFB050', 'glow', { light: '#FF9A40' }), Q(Math.round(bx + bw * .45), Math.round(by + bhh * .15), 1, 1), { nl: 1, lr: 5 });
      k.add(3.44, 'up', patch, R(bx + bw * .45, by + bhh * .5, k.U(1.6), k.U(1.6)), { clip: bk });
      head(k, skin); face(k, { eye: this.eye, brow: '#8A3018' });
      // wild ginger hair sticking out under the hat, front and back
      hairShort(k, hair);
      k.add(.5, 'head', hair, P(hx - hw * .8, hy - hh * .5, hx - hw * 1.75, hy - hh * .25, hx - hw * 1.25, hy + hh * .05, hx - hw * 1.9, hy + hh * .45, hx - hw * 1.2, hy + hh * .65, hx - hw * 1.55, hy + hh * 1.2, hx - hw * .6, hy + hh * .95));
      k.add(4.25, 'head', hair, P(hx + hw * .5, hy - hh * .6, hx + hw * 1.3, hy - hh * .4, hx + hw * 1, hy - hh * .15, hx + hw * 1.25, hy + hh * .1, hx + hw * .7, hy - hh * .1), { sep: 1 });
      // pointed hat: wide brim, bent cone, ember band, a patch
      k.add(4.5, 'head', hat, E(hx, hy - hh * .5, hw * 1.6, hh * .28), { sep: 1 });
      const cone = k.add(4.45, 'head', hat, P(hx - hw * .95, hy - hh * .55, hx + hw * .95, hy - hh * .55, hx + hw * .4, hy - hh * 1.5, hx - hw * .3, hy - hh * 2.3, hx - hw * 1.3, hy - hh * 2.6, hx - hw * .75, hy - hh * 1.6), { bev: 1 });
      k.add(4.47, 'head', ember, R(hx - hw * 1.2, hy - hh * .98, hw * 2.4, k.U(1.4)), { clip: cone });
      k.add(4.48, 'head', patch, R(hx - hw * .55, hy - hh * 1.75, k.U(1.6), k.U(1.6)), { clip: cone });
      arm(k, 'F', robe, skin, { bell: robe, bellTrim: ember });
      // singed staff with an ember at the top (tier on the wood, gold band from Rare, crystal from Epic)
      const up = k.H * .64, dn = k.H * .22;
      k.held(5.9, 'F', .08, [
        [w.P, R(-.8, -up, 1.6, up + dn), { bev: .6 }],
        [charc, P(-.9, -up + .5, -1.8, -up - 2.4, -.2, -up - 1.4, .6, -up - 3.4, 1.8, -up - 1.2, .9, -up + .5)],
        [w.r >= 2 ? w.C : m('#FFB050', 'glow', { light: '#FF9A40' }), E(0, -up - 1.8, 1.3, 1.6), { lr: 12, pulse: 1 }],
        w.r >= 1 ? [w.R, R(-1.1, -up + 3, 2.2, 1.2)] : null
      ]);
    } };

  // ---------------- Bram Hollis, the Woodcutter (Common striker, melee) ----------------
  // Stocky: a brown knit cap, a big auburn beard, a red plaid shirt with the sleeves rolled up,
  // an open leather vest, tall boots and a long woodsman's axe held up by his shoulder.
  AK.CHARS.bram = { name: 'Bram', circle: 'hedgefolk', hs: 1, ws: 1.24, armW: 1.1, handS: 1.08, aF: -.45, aB: -.35, anim: 'chop', eye: '#2E1E18',
    wpn: { fam: 'wood', fam2: 'ore', t: 2, r: 0 },
    build(k, w) {
      const plaid = m('#B03C30'), plaidD = m('#5E1C22'), plaidL = m('#E09A6A'), vest = m('#7A5434', 'leather'), lea = m('#4E3226', 'leather'), tr = m('#56503C'), boot = m('#4A3428', 'leather'), skin = m(SKINS[0], 'skin'), hair = m('#3E2418', 'hair'), bd = m('#B0602C', 'hair'), cap = m('#6A5236'), capD = m('#4E3A26'), iron = m('#8C909C', 'metal');
      const { hx, hy, hw, hh, sw } = k;
      legs(k, tr, boot, { cuff: lea, tall: 1.25 });
      arm(k, 'B', plaid, skin, { bare: skin, big: 1.1 });
      // red plaid shirt: dark bands and a thin light check
      const sh = k.add(3, 'up', plaid, torsoShape(k, { bot: k.hiY + k.legR * .5, ww: .92 }));
      for (const x of [-.55, .25]) k.add(3.02, 'up', plaidD, R(sw * x, k.shY, k.U(1.5), 20), { clip: sh, nl: 1 });
      for (const y of [.28, .7]) k.add(3.02, 'up', plaidD, R(-20, k.shY + (k.waY - k.shY) * y, 40, k.U(1.5)), { clip: sh, nl: 1 });
      k.add(3.025, 'up', plaidL, R(sw * .7, k.shY, k.U(.8), 20), { clip: sh, nl: 1 });
      // open leather vest
      k.add(3.1, 'up', vest, P(-sw * .98, k.shY + .6, -sw * .2, k.shY + .6, -sw * .1, k.waY + 1.4, -sw * .92, k.waY + 1.6), { bev: 1 });
      k.add(3.1, 'up', vest, P(sw * .5, k.shY + .6, sw * .98, k.shY + .8, sw * .92, k.waY + 1.6, sw * .6, k.waY + 1.4), { bev: 1 });
      belt(k, lea, { buckle: iron, w: 2.4 });
      // flask at the belt
      k.add(3.4, 'up', iron, rrect(-k.hipW * 1.3, k.waY + k.U(1.2), k.U(2.8), k.U(3.8), k.U(.8)));
      k.add(3.42, 'up', lea, R(-k.hipW * 1.3, k.waY + k.U(2.4), k.U(2.8), k.U(1)), { nl: 1 });
      head(k, skin); face(k, { eye: this.eye, brow: '#3E2014' });
      // dark hair at the nape, auburn beard
      k.add(4.15, 'head', hair, P(hx - hw * 1.08, hy - hh * .5, hx - hw * .3, hy - hh * .3, hx - hw * .45, hy + hh * .5, hx - hw * 1.05, hy + hh * .6));
      beard(k, bd, { long: .85 });
      // knit cap with a rolled brim
      k.add(4.3, 'head', cap, P(arcPts(hx - hw * .1, hy - hh * .62, hw * 1.05, hh * .9, Math.PI * 1.02, Math.PI * 1.98, 12)), { bev: 1.2 });
      k.add(4.35, 'head', capD, rrect(hx - hw * 1.2, hy - hh * .82, hw * 2.25, k.U(2.1), k.U(.8)), { sep: 1 });
      arm(k, 'F', plaid, skin, { bare: skin, big: 1.12 });
      // the long woodsman's axe, head up by his shoulder (tier on the haft and the head)
      const up = k.H * .56, dn = k.H * .16;
      k.held(7, 'F', .16, [
        [w.P, R(-.9, -up, 1.8, up + dn), { bev: .6 }],
        [w.Q, P(.4, -up - .6, 3.4, -up - 1.6, 6.2, -up - 3.6, 7, -up + 1.2, 6.2, -up + 5.4, 3.4, -up + 3, .4, -up + 2.2), { bev: .8 }],
        [m('#D8DCE4', 'metal'), P(5.6, -up - 3.2, 7, -up - 3.6, 7.6, -up + 1.2, 7, -up + 5.6, 5.6, -up + 4.8), { nl: 1 }],
        [w.Q, P(-.4, -up - .2, -2.6, -up + .2, -2.6, -up + 2, -.4, -up + 2.2)],
        [lea, R(-1.1, -up * .1, 2.2, 3.2)],
        w.r >= 1 ? [w.R, R(-1.1, -up + 3, 2.2, 1.2)] : null,
        w.G ? [w.G, Q(3, -up + .5, 1, 1), { nl: 1, lr: 8 }] : null
      ]);
    } };
}
