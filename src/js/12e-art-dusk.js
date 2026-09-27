// 12e-art-dusk: the Dusk Company circle in B1 (Kestrel, Isolde, Oriel, Corvin). DATA only.
// Entry format: see 12c-art-hedgefolk.js. Kit and rules: 12a-art-body.js, docs/design/art-direction.md.
{
  const { m, E, P, C, R, Q, arcPts, rrect, legs, torsoShape, robeShape, arm, head, face, hairShort, hood, belt, SKINS } = AK;

  // ---------------- Kestrel Thane, the Skyfall Dragoon (Rare striker, melee) ----------------
  AK.CHARS.kestrel = { name: 'Kestrel', circle: 'dusk', hs: 1.04, ws: .95, aF: -.2, aB: -.3, anim: 'thrust', eye: '#241A18',
    wpn: { fam: 'wood', fam2: 'ore', t: 2, r: 1 },
    build(k, w) {
      const u = k.u;
      const teal = m('#2E6E6E'), tealD = m('#1F4A4E'), steel = m('#7E98B8', 'metal'), steelD = m('#5A6E8A', 'metal'), white = m('#DCE4EE'), lea = m('#4E3A2E', 'leather'), skin = m(SKINS[1], 'skin'), hair = m('#2A2030', 'hair');
      // cape shaped like a folded wing, feather tips at the hem
      const cp = k.add(.2, 'up', teal, P(-k.sw * .8, k.shY - .5, k.sw * .3, k.shY, -k.hipW * .5, k.hiY * .45, -k.hipW * 1, k.hiY * .3, -k.hipW * 1.4, k.hiY * .5, -k.hipW * 1.8, k.hiY * .35, -k.hipW * 2.3, k.hiY * .55, -k.sw * 1.35, k.waY), { bev: 1 });
      k.add(.25, 'up', tealD, P(-k.sw * 1.1, k.waY - 3, -k.sw * .9, k.waY - 3, -k.hipW * 1.3, k.hiY * .45, -k.hipW * 1.6, k.hiY * .4), { clip: cp });
      legs(k, tealD, steelD, { greave: steel });
      arm(k, 'B', teal, lea, { bracer: steel });
      // teal tunic skirt, steel breastplate
      k.add(3, 'up', teal, torsoShape(k, { bot: k.hiY * .5, bw: 1.25 }));
      k.add(3.1, 'up', steel, P(-k.sw * .8, k.shY + .6, k.sw * .88, k.shY + .6, k.sw * .82, k.waY - .6, -k.sw * .75, k.waY - .6), { bev: 1.2 });
      belt(k, lea, { buckle: m('#D8CFB8'), w: 1.8 });
      head(k, skin); face(k, { eye: this.eye, brow: '#241A18' });
      hairShort(k, hair, { long: 1.1 });
      const { hx, hy, hw, hh } = k;
      // winged helm: cap with cheek guard, white wings sweeping back
      const helm = k.add(4.3, 'head', steel, P(hx - hw * 1.15, hy + hh * .5, arcPts(hx - hw * .05, hy + hh * .05, hw * 1.12, hh * 1.1, Math.PI * .96, Math.PI * 1.97, 12), hx + hw * 1.15, hy - hh * .2, hx + hw * .4, hy - hh * .3, hx - hw * .3, hy + hh * .1), { sep: 1 });
      k.add(4.32, 'head', steelD, R(hx - hw * 1.3, hy - hh * .45, hw * 2.6, k.U(1)), { clip: helm });
      k.add(4.4, 'head', white, P(hx - hw * .7, hy - hh * .6, hx - hw * 1.3, hy - hh * 1.6, hx - hw * 2.2, hy - hh * 2, hx - hw * 1.8, hy - hh * 1.3, hx - hw * 2.3, hy - hh * 1.1, hx - hw * 1.6, hy - hh * .6, hx - hw * 1.9, hy - hh * .2, hx - hw * 1.1, hy - hh * .1), { bev: .8, sep: 1 });
      arm(k, 'F', teal, lea, { bracer: steel, cuff: lea });
      // the long spear (role weapon)
      const up = k.H * .78, dn = k.H * .3;
      k.held(7, 'F', .1, [
        [w.P, R(-.6, -up, 1.2, up + dn)],
        [w.r >= 1 ? w.R : steelD, R(-1, -up, 2, 1)],
        [w.Q, P(0, -up - 5.5, 1.6, -up - 2, .9, -up, -.9, -up, -1.6, -up - 2), { bev: .6 }],
        [teal, P(.6, -up + 1, 1.6, -up + 1, 2.4, -up + 4, 1, -up + 3.2)],
        w.G ? [w.G, R(-.3, -up - 4, .6, 3), { nl: 1, lr: 7 }] : null
      ]);
      k.add(6.4, 'armF', steel, E(k.pF[0] + .3 * u, k.pF[1] - .1 * u, k.armR * 1.7, k.armR * 1.35));
    } };

  // ---------------- Isolde Marrow, the Duskblade (Epic striker, melee) ----------------
  AK.CHARS.isolde = { name: 'Isolde', circle: 'dusk', hs: 1, ws: .86, aF: -.35, aB: .15, anim: 'twin', eye: '#1E1620',
    wpn: { fam: 'ore', fam2: 'hide', t: 3, r: 2, glow: '#F0A0B8' },
    build(k, w) {
      const u = k.u;
      const dusk = m('#2E2636'), duskD = m('#1E1824'), rose = m('#B0566E'), lea = m('#3E2E34', 'leather'), skin = m(SKINS[0], 'skin'), hair = m('#1E1620', 'hair'), page = m('#E8DEC8'), seal = m('#9E2E3A');
      const { hx, hy, hw, hh } = k;
      // high tail of black hair
      k.add(.5, 'head', hair, P(hx - hw * .4, hy - hh * 1.05, hx - hw * .9, hy - hh * 1.2, hx - hw * 1.8, hy - hh * .6, hx - hw * 2.1, hy + hh * .9, hx - hw * 1.5, hy + hh * .3, hx - hw * 1, hy - hh * .5));
      // rose sash end trailing behind
      k.add(.3, 'up', rose, P(-k.sw * .6, k.waY - .5, -k.sw * .3, k.waY + .5, -k.sw * 1.4, k.waY + 6, -k.sw * 1.8, k.waY + 5));
      legs(k, dusk, duskD, { cuff: rose });
      arm(k, 'B', dusk, lea, { cuff: lea });
      // fitted dusk leathers, a rose sash across the chest
      k.add(3, 'up', dusk, torsoShape(k, { bot: k.hiY * .6, bw: 1.1, ww: .8 }), { bev: 1.1 });
      k.add(3.2, 'up', rose, P(-k.sw * .8, k.shY + .6, -k.sw * .45, k.shY + .3, k.sw * .85, k.waY - .4, k.sw * .55, k.waY + .6));
      belt(k, rose, { w: 1.8 });
      // the torn contract pinned to her belt, with its wax seal
      k.add(3.4, 'up', page, P(k.sw * .1, k.waY + .8, k.sw * .75, k.waY + .8, k.sw * .8, k.waY + 5, k.sw * .5, k.waY + 4.2, k.sw * .3, k.waY + 5.2, k.sw * .1, k.waY + 4.4));
      k.add(3.42, 'up', seal, Q(Math.round(k.sw * .4), Math.round(k.waY + 1.4), 1, 1), { nl: 1 });
      head(k, skin); face(k, { eye: this.eye, brow: '#1E1620' });
      hairShort(k, hair);
      // mask over the lower face
      k.add(4.5, 'head', dusk, P(hx - hw * .35, hy + hh * .2, hx + hw * 1.1, hy + hh * .15, hx + hw * 1.05, hy + hh * .8, hx + hw * .4, hy + hh * 1.15, hx - hw * .3, hy + hh * .95), { sep: 1 });
      // twin short blades (role weapon): back hand reverse grip, front hand forward
      const dl = k.H * .24;
      const blade = () => [
        [lea, R(-k.U(.8), -k.U(2), k.U(1.6), k.U(4))],
        [w.r >= 1 ? w.R : w.D, R(-k.U(2.2), -k.handR - k.U(1.2), k.U(4.4), k.U(1.1))],
        [w.P, P(-1, -k.handR - k.U(1.2), 1, -k.handR - k.U(1.2), .8, -dl + 1.5, 0, -dl, -.8, -dl + 1.5), { bev: .6 }],
        w.G ? [w.G, R(-.3, -dl + 2, .6, dl * .5), { nl: 1, lr: 7 }] : null
      ];
      k.held(5.5, 'B', 2.8, blade());
      arm(k, 'F', dusk, lea, { cuff: lea });
      k.held(7, 'F', .5, blade());
      k.add(6.4, 'armF', duskD, E(k.pF[0] + .2 * u, k.pF[1], k.armR * 1.4, k.armR * 1.1));
    } };

  // ---------------- Oriel Vess, the Starcaller (Epic caster) ----------------
  AK.CHARS.oriel = { name: 'Oriel', circle: 'dusk', hs: 1.08, ws: .92, aF: -.3, aB: -.2, anim: 'cast', eye: '#1A1420',
    wpn: { fam: 'wood', fam2: 'crystal', t: 3, r: 2 },
    build(k, w) {
      const u = k.u;
      const indigo = m('#3A3478'), indigoD = m('#26224E'), lilac = m('#C8B8E8'), gold = m('#E0AE44', 'metal'), skin = m(SKINS[2], 'skin'), hair = m('#2A2438', 'hair'), star = m('#F4EEFF', 'glow', { light: '#C8C0FF' }), pt = m('#DCD4FF', 'flat');
      // tall standing collar behind the head
      k.add(.3, 'up', indigo, P(-k.sw * .9, k.shY + 1, -k.sw * 1.1, k.shY - 5, -k.sw * .6, k.shY - 9.5, -k.sw * .1, k.shY - 4, k.sw * .2, k.shY + 1), { bev: .9 });
      k.add(.32, 'up', lilac, P(-k.sw * 1.1, k.shY - 5, -k.sw * .6, k.shY - 9.5, -k.sw * .45, k.shY - 8.5, -k.sw * .9, k.shY - 4.5));
      legs(k, indigoD, m('#2A2238', 'leather'), {});
      arm(k, 'B', indigo, skin, { bell: indigo, bellTrim: lilac });
      // floor-length star-pricked robe with a lilac front band
      const hem = -k.U(.4);
      const rb = k.add(3, 'up', indigo, robeShape(k, { hem }), { bev: 1.2 });
      k.add(3.05, 'up', lilac, P(k.sw * .1, k.shY, k.sw * .45, k.shY, k.hipW * .7, hem, k.hipW * .2, hem), { clip: rb });
      k.add(3.06, 'up', lilac, R(-20, hem - k.U(1.2), 40, k.U(1.2)), { clip: rb });
      for (const [x, y] of [[-.55, .3], [-.3, .62], [.7, .5], [-.7, .85], [.9, .92]]) k.add(3.1, 'up', pt, Q(Math.round(k.sw * x), Math.round(k.shY + (hem - k.shY) * y), 1, 1), { nl: 1 });
      k.add(3.3, 'up', gold, R(-k.sw * .82, k.waY - k.U(.6), k.sw * 1.64, k.U(1.2)));
      k.add(3.35, 'up', gold, E(-k.sw * .4, k.waY + 2, 1.3, 1.3));
      head(k, skin); face(k, { eye: this.eye, brow: '#1A1420' });
      hairShort(k, hair, { long: 1.4 });
      arm(k, 'F', indigo, skin, { bell: indigo, bellTrim: lilac });
      // staff topped with a hanging star (role weapon)
      const up = k.H * .74, dn = k.H * .24;
      k.held(5.9, 'F', .05, [
        [w.P, R(-.6, -up, 1.2, up + dn)],
        [w.P, P(-.6, -up, -.2, -up - 2.5, 2.5, -up - 3.6, 4.6, -up - 2, 4.2, -up - .6, 2.8, -up - 2, .6, -up - 1.2, .6, -up + .6)],
        [m('#E8DEC8', 'flat'), R(3.6, -up - .8, .5, 2.4), { nl: 1 }],
        [w.r >= 2 ? w.C : star, P(3.9, -up + 1, 4.5, -up + 2.2, 5.8, -up + 2.4, 4.8, -up + 3.2, 5.2, -up + 4.6, 3.9, -up + 3.8, 2.6, -up + 4.6, 3, -up + 3.2, 2, -up + 2.4, 3.3, -up + 2.2), { lr: 16, pulse: 1 }],
        w.r >= 1 ? [w.R, R(-1, -up + 3, 2, 1)] : null
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
