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
  AK.CHARS.wren = { name: 'Wren', circle: 'hedgefolk', hs: .98, ws: .9, aF: -.15, aB: -.55, anim: 'shoot', eye: '#2A1C18',
    wpn: { fam: 'wood', fam2: 'hide', t: 2, r: 1 },
    build(k, w) {
      const u = k.u, po = k.pose;
      const green = m('#34603A'), greenD = m('#24402C'), violet = m('#6B4A9A'), lea = m('#5A3C2A', 'leather'), tr = m('#3A3440'), boot = m('#3E2C26', 'leather'), skin = m(SKINS[1], 'skin'), hair = m('#2A1C18', 'hair');
      // long bat-violet scarf trailing behind
      k.add(.25, 'up', violet, P(-k.sw * .3, k.shY - .6, k.sw * .2, k.shY + .4, -k.sw * .75, k.shY + 3, -k.sw * 1.1, k.waY + 2, -k.sw * 1.6, k.waY + 4.5, -k.sw * 1.75, k.waY + 1.5, -k.sw * 1.5, k.shY + 3.4), { bev: .8 });
      legs(k, tr, boot, { cuff: lea });
      arm(k, 'B', green, lea, { bracer: lea });
      k.add(3, 'up', green, torsoShape(k, { bot: k.hiY * .45, bw: 1.2 }), { bev: 1.1 });
      k.add(3.05, 'up', greenD, P(-k.hipW * 1.2, k.hiY * .45 - k.U(1.2), k.hipW * 1.2, k.hiY * .45 - k.U(1.2), k.hipW * 1.3, k.hiY * .45, -k.hipW * 1.3, k.hiY * .45));
      belt(k, lea, { buckle: m('#B8B0A0', 'metal'), w: 1.8 });
      // quiver strap and quiver
      k.add(3.35, 'up', lea, P(-k.sw * .9, k.shY + 1, -k.sw * .5, k.shY + .2, k.sw * .8, k.waY - .4, k.sw * .5, k.waY + .6));
      const qx = -k.sw * .5, qy = k.shY + 1;
      k.add(.5, 'up', lea, P(qx - 2, qy - 1, qx + .2, qy - 2.2, qx + 3.2, qy + 9, qx + 1.2, qy + 10), { bev: .8 });
      k.add(.45, 'up', m('#E8E0D0'), P(qx - 3, qy - 3.6, qx - 1.4, qy - 4.8, qx - .2, qy - 1.6, qx - 1.6, qy - 1));
      head(k, skin); face(k, { eye: this.eye });
      hairShort(k, hair);
      // hood up, violet scarf wrapped at the neck
      hood(k, greenD, { trim: null });
      k.add(3.9, 'up', violet, E(k.hx - .2, k.shY + .6, k.sw * .6, k.U(1.6)), { sep: 1 });
      arm(k, 'F', green, lea, { cuff: lea });
      // longbow, taller than her
      const bh = k.H * .44, dr = !!po.drawn, pull = dr ? 5 : 0;
      const items = [
        [w.P, P(-.7, -1, .5, -1, 2.4, -bh * .45, 2, -bh * .95, .6, -bh, 1.1, -bh * .45, -.7, -1.6)],
        [w.P, P(-.7, 1, .5, 1, 2.4, bh * .45, 2, bh * .95, .6, bh, 1.1, bh * .45, -.7, 1.6)],
        [w.Q, R(-.9, -1.6, 1.8, 3.2)]
      ];
      if (w.r >= 1) items.push([w.R, Q(1, -Math.round(bh) - .5, 1, 1)], [w.R, Q(1, Math.round(bh) - .5, 1, 1)]);
      if (w.G) items.push([w.G, R(1.8, -bh * .7, .7, bh * .3), { nl: 1, lr: 7 }]);
      const str = m('#E8DEC8', 'flat');
      if (!dr) items.push([str, R(1, -bh + .3, .6, bh * 2 - .6), { nl: 1 }]);
      else items.push([str, P(1, -bh + .3, 1.6, -bh + .3, -pull + .6, .3, -pull, .3), { nl: 1 }], [str, P(-pull, -.3, -pull + .6, -.3, 1.6, bh - .3, 1, bh - .3), { nl: 1 }],
        [m('#6E4A30', 'wood'), R(-pull, -.5, pull + 7, 1)], [m('#C8CCD4', 'metal'), P(6.6, -1.2, 8.4, 0, 6.6, 1.2)]);
      k.held(5.5, 'B', po.rB < -.5 ? 0 : .28, items);
    } };

  // ---------------- Old Hesketh, the Lamplighter (Common support) ----------------
  AK.CHARS.hesketh = { name: 'Hesketh', circle: 'hedgefolk', hs: .96, ws: 1, aF: -.55, aB: -.2, anim: 'cast', eye: '#3A2A22', pose: { lean: .1, hb: .6 },
    wpn: { fam: 'wood', fam2: 'ore', t: 1, r: 0 },
    build(k, w) {
      const u = k.u;
      const coat = m('#6E6878'), coatD = m('#4A4652'), amber = m('#E09A3E'), lea = m('#5A3E2C', 'leather'), boot = m('#3E302A', 'leather'), skin = m(SKINS[0], 'skin'), white = m('#D8D2C8', 'hair'), brass = m('#C8A050', 'metal');
      legs(k, m('#403A44'), boot, {});
      arm(k, 'B', coat, skin, { cuff: coatD });
      // long soot-grey coat to the shins, darker lapels
      const hem = -k.bootH * 1.1;
      const ct = k.add(3, 'up', coat, robeShape(k, { hem, flare: .9 }), { bev: 1.2 });
      k.add(3.04, 'up', coatD, P(k.sw * .15, k.shY + .5, k.sw * .55, k.shY + .5, k.hipW * .75, hem, k.hipW * .3, hem), { clip: ct });
      belt(k, lea, { buckle: brass, w: 2 });
      // lamp-amber scarf, one tail down the front
      k.add(3.8, 'up', amber, E(k.hx - .2, k.shY + .5, k.sw * .62, k.U(1.7)), { sep: 1 });
      k.add(3.82, 'up', amber, P(k.sw * .25, k.shY + 1, k.sw * .6, k.shY + 1, k.sw * .55, k.shY + 7, k.sw * .2, k.shY + 6.5));
      // tinderbox lantern at the belt
      k.add(3.4, 'up', brass, R(-k.hipW * 1.1, k.waY + k.U(1), k.U(2.4), k.U(1)));
      k.add(3.42, 'up', m('#FFD27A', 'glow', { light: '#FFC070' }), R(-k.hipW * 1.05, k.waY + k.U(2), k.U(2.1), k.U(2.6)), { lr: 12, pulse: 1 });
      head(k, skin); face(k, { eye: this.eye, brow: '#C8C0B4' });
      hairFringe(k, white);
      beard(k, white, { long: 1.4 });
      // flat cap
      const { hx, hy, hw, hh } = k;
      k.add(4.5, 'head', coatD, P(arcPts(hx - hw * .1, hy - hh * .45, hw * 1.05, hh * .7, Math.PI, Math.PI * 2, 10), hx + hw * 1.45, hy - hh * .35, hx + hw * 1.3, hy - hh * .15, hx - hw * 1.1, hy - hh * .35), { sep: 1, bev: 1 });
      arm(k, 'F', coat, skin, { cuff: coatD });
      // the lighting pole, a small flame on a brass hook at the top
      const up = k.H * .95, dn = k.H * .08;
      k.held(5.9, 'F', .08, [
        [w.P, R(-.7, -up, 1.4, up + dn)],
        [w.r >= 1 ? w.R : brass, R(-.8, -up - 1, 4, 1.1)],
        [w.r >= 1 ? w.R : brass, R(2.2, -up - 1, 1.1, 2.6)],
        [m('#FFE08A', 'glow', { light: '#FFB060' }), E(2.8, -up + 2.6, 1.1, 1.5), { lr: 14, pulse: 1 }],
        w.G ? [w.G, Q(0, -up * .6, 1, 1), { nl: 1, lr: 7 }] : null
      ]);
    } };

  // ---------------- Pip Cinderly, the Hedge Mage (Common caster) ----------------
  AK.CHARS.pip = { name: 'Pip', circle: 'hedgefolk', hs: .84, ws: .98, hd: 1.04, aF: -.35, aB: -.1, anim: 'cast', eye: '#2A1A22',
    wpn: { fam: 'wood', fam2: 'crystal', t: 1, r: 0 },
    build(k, w) {
      const u = k.u;
      const robe = m('#6A3E8E'), robeD = m('#48286A'), hat = m('#4A2E68'), patch = m('#B07A3E'), ember = m('#E0702E'), lea = m('#6E4A30', 'leather'), skin = m(SKINS[0], 'skin'), hair = m('#D0582A', 'hair'), page = m('#EFE6D0'), charc = m('#3A2C2A');
      legs(k, m('#3E3044'), lea, {});
      arm(k, 'B', robe, skin, { bell: robe });
      // patched robe to the knee, ember sash
      const rb = k.add(3, 'up', robe, robeShape(k, { hem: -k.bootH * 1.4, flare: .95 }), { bev: 1.2 });
      k.add(3.04, 'up', patch, R(-k.hipW * .9, k.hiY * .5, k.U(2.2), k.U(2.2)), { clip: rb });
      k.add(3.04, 'up', robeD, R(-20, -k.bootH * 1.4 - k.U(1.2), 40, k.U(1.2)), { clip: rb });
      k.add(3.3, 'up', ember, R(-k.sw * .85, k.waY - k.U(1), k.sw * 1.7, k.U(2)));
      k.add(3.32, 'up', ember, P(k.sw * .4, k.waY + k.U(.8), k.sw * .65, k.waY + k.U(.8), k.sw * .8, k.waY + k.U(5.5), k.sw * .5, k.waY + k.U(5)));
      // singed book on a strap at her hip
      k.add(3.35, 'up', lea, P(-k.sw * .8, k.shY + .6, -k.sw * .45, k.shY + .2, k.sw * .1, k.waY + 2, -k.sw * .2, k.waY + 2.6));
      k.add(3.4, 'up', m('#8A4A2E', 'leather'), rrect(-k.hipW * 1.45, k.waY + k.U(1.2), k.U(4), k.U(4.4), k.U(.6)));
      k.add(3.42, 'up', page, R(-k.hipW * 1.45 + k.U(3.2), k.waY + k.U(1.8), k.U(.9), k.U(3.4)));
      k.add(3.43, 'up', charc, Q(Math.round(-k.hipW * 1.45), Math.round(k.waY + k.U(1.2)), 1, 1), { nl: 1 });
      head(k, skin); face(k, { eye: this.eye, brow: '#8A3018' });
      const { hx, hy, hw, hh } = k;
      // wild ginger hair sticking out under the hat
      hairShort(k, hair);
      k.add(.5, 'head', hair, P(hx - hw * .8, hy - hh * .5, hx - hw * 1.7, hy - hh * .2, hx - hw * 1.2, hy + hh * .1, hx - hw * 1.8, hy + hh * .5, hx - hw * 1.1, hy + hh * .7, hx - hw * 1.4, hy + hh * 1.2, hx - hw * .6, hy + hh * .9));
      // pointed hat: wide brim, bent cone, ember band, a patch
      k.add(4.5, 'head', hat, E(hx, hy - hh * .5, hw * 1.55, hh * .28), { sep: 1 });
      const cone = k.add(4.45, 'head', hat, P(hx - hw * .95, hy - hh * .55, hx + hw * .95, hy - hh * .55, hx + hw * .4, hy - hh * 1.5, hx - hw * .3, hy - hh * 2.3, hx - hw * 1.3, hy - hh * 2.55, hx - hw * .75, hy - hh * 1.6), { bev: 1 });
      k.add(4.47, 'head', ember, R(hx - hw * 1.2, hy - hh * .95, hw * 2.4, k.U(1.2)), { clip: cone });
      arm(k, 'F', robe, skin, { bell: robe });
      // singed staff with an ember at the top
      const up = k.H * .62, dn = k.H * .22;
      k.held(5.9, 'F', .08, [
        [w.P, R(-.7, -up, 1.4, up + dn)],
        [charc, P(-.9, -up + .5, -1.6, -up - 2.4, -.2, -up - 1.4, .6, -up - 3.2, 1.6, -up - 1.2, .9, -up + .5)],
        [w.r >= 2 ? w.C : m('#FFB050', 'glow', { light: '#FF9A40' }), E(0, -up - 1.8, 1.2, 1.5), { lr: 12, pulse: 1 }],
        w.r >= 1 ? [w.R, R(-1, -up + 3, 2, 1)] : null
      ]);
    } };

  // ---------------- Bram Hollis, the Woodcutter (Common striker, melee) ----------------
  AK.CHARS.bram = { name: 'Bram', circle: 'hedgefolk', hs: 1, ws: 1.24, armW: 1.1, handS: 1.08, aF: -.45, aB: -.35, anim: 'chop', eye: '#2E1E18',
    wpn: { fam: 'wood', fam2: 'ore', t: 2, r: 0 },
    build(k, w) {
      const u = k.u;
      const plaid = m('#A83A30'), plaidD = m('#5A1C22'), vest = m('#6A4A30', 'leather'), lea = m('#4E3226', 'leather'), tr = m('#5A4632'), boot = m('#4A3428', 'leather'), skin = m(SKINS[0], 'skin'), hair = m('#5A2E1A', 'hair'), iron = m('#8C909C', 'metal');
      legs(k, tr, boot, { cuff: lea, tall: 1.2 });
      arm(k, 'B', plaid, skin, { bare: skin, big: 1.1 });
      // red plaid shirt with dark checks, an open leather vest
      const sh = k.add(3, 'up', plaid, torsoShape(k, { bot: k.hiY + k.legR * .5, ww: .92 }));
      for (const x of [-.45, .35]) k.add(3.02, 'up', plaidD, R(k.sw * x, k.shY, k.U(1), 20), { clip: sh, nl: 1 });
      for (const y of [.3, .65]) k.add(3.02, 'up', plaidD, R(-20, k.shY + (k.waY - k.shY) * y, 40, k.U(1)), { clip: sh, nl: 1 });
      k.add(3.1, 'up', vest, P(-k.sw * .95, k.shY + .6, -k.sw * .25, k.shY + .6, -k.sw * .15, k.waY + 1, -k.sw * .9, k.waY + 1.2), { bev: 1 });
      k.add(3.1, 'up', vest, P(k.sw * .45, k.shY + .6, k.sw * .95, k.shY + .8, k.sw * .9, k.waY + 1.2, k.sw * .55, k.waY + 1), { bev: 1 });
      belt(k, lea, { buckle: iron, w: 2.3 });
      // flask at the belt
      k.add(3.4, 'up', iron, rrect(-k.hipW * 1.25, k.waY + k.U(1), k.U(2.6), k.U(3.6), k.U(.8)));
      head(k, skin); face(k, { eye: this.eye, brow: '#4A2414' });
      hairShort(k, hair);
      beard(k, hair, { long: .8 });
      arm(k, 'F', plaid, skin, { bare: skin, big: 1.12 });
      // the long woodsman's axe, head up by his shoulder
      const up = k.H * .5, dn = k.H * .16;
      k.held(7, 'F', .22, [
        [w.P, R(-.8, -up, 1.6, up + dn)],
        [w.Q, P(.6, -up - .5, 4.6, -up - 2.8, 5.8, -up + 2.2, 4.6, -up + 4.4, .6, -up + 2.2), { bev: .7 }],
        [m('#C8CCD4', 'metal'), R(4.6, -up - 2.4, 1.1, 6.6), { nl: 1 }],
        w.r >= 1 ? [w.R, R(-1, -up * .15, 2, 2)] : null,
        w.G ? [w.G, Q(3, -up + .5, 1, 1), { nl: 1, lr: 8 }] : null
      ]);
    } };
}
