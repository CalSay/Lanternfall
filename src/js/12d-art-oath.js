// 12d-art-oath: the Oath circle in B1 (Maren, Aldric, Anselm, Elowen, Caedmon). DATA only.
// Entry format: see 12c-art-hedgefolk.js. Kit and rules: 12a-art-body.js, docs/design/art-direction.md.
{
  const { m, mix, E, P, C, R, Q, arcPts, ringP, rrect, legs, torsoShape, robeShape, arm, head, face, hairShort, hairFringe, beard, hood, belt, SKINS } = AK;

  // ---------------- Maren Ashvale, the Lampwarden (Rare tank) ----------------
  AK.CHARS.maren = { name: 'Maren', circle: 'oath', hs: 1.06, ws: 1.04, aF: -.28, aB: -.55, anim: 'bash', eye: '#9FF0E0',
    wpn: { fam: 'ore', fam2: 'wood', t: 2, r: 1 },
    build(k, w) {
      const u = k.u;
      const ash = m('#7C7888'), ashD = m('#524E5E'), teal = m('#56A69C'), steel = m('#7E8AA0', 'metal'), dsteel = m('#586278', 'metal'), lea = m('#5E4636', 'leather'), boot = m('#4A3A34', 'leather'), skin = m(SKINS[1], 'skin'), wood = m('#6E4A30', 'wood'), light = m('#AEF6E6', 'glow', { light: '#8FEBDA' });
      // cloak behind the body, with a clear teal-edged hem
      const hem = -k.bootH * .5;
      const ck = k.add(.2, 'up', ash, P(-k.sw * .9, k.shY, k.sw * .5, k.shY, -k.hipW * .2, hem, -k.hipW * 1.95, hem + k.U(1), -k.hipW * 1.7, k.waY), { bev: 1.1 });
      k.add(.25, 'up', teal, R(-30, hem - k.U(1.5), 60, k.U(1.5)), { clip: ck });
      legs(k, m('#3E3A48'), boot, { greave: steel, sole: m('#2E2428', 'leather') });
      arm(k, 'B', ashD, lea, { cuff: lea });
      k.add(3, 'up', dsteel, torsoShape(k, { bot: k.hiY + k.legR * .6 }));
      k.add(3.1, 'up', steel, P(-k.sw * .8, k.shY + 1 * u, k.sw * .85, k.shY + 1 * u, k.sw * .82, k.waY - k.U(1), -k.sw * .75, k.waY - k.U(1)), { bev: 1.2 });
      k.add(3.2, 'up', teal, P(k.sw * .6, k.shY + 1 * u, k.sw * .95, k.shY + 2.2 * u, -k.sw * .5, k.waY, -k.sw * .85, k.waY - 1.2 * u));
      // mail skirt, belt with a pouch
      k.add(3.05, 'up', m('#6A7288', 'metal'), P(-k.hipW * 1.12, k.waY, k.hipW * 1.12, k.waY, k.hipW * 1.25, k.hiY * .4, -k.hipW * 1.2, k.hiY * .4));
      k.add(3.3, 'up', lea, R(-k.sw * .9, k.waY - k.U(1), k.sw * 1.8, k.U(2.2)));
      k.add(3.35, 'up', m('#C8CCD8', 'metal'), R(k.sw * .05, k.waY - k.U(1), k.U(1.6), k.U(2.2)));
      k.add(3.4, 'up', lea, rrect(-k.hipW * 1.3, k.waY + k.U(1), k.U(3), k.U(3), k.U(1)));
      // the cloak drapes over the back shoulder
      k.add(3.7, 'up', ash, P(-k.sw * 1.05, k.shY + 1 * u, -k.sw * .1, k.shY - .5 * u, -k.sw * .3, k.waY - 1 * u, -k.sw * 1.15, k.waY + 2 * u), { bev: 1 });
      // hood up, face in shadow, two lit eyes
      head(k, skin);
      hood(k, ash, { shadow: '#1C1622' });
      face(k, { glow: '#AEF6E6' });
      // tower shield on the back arm with a lantern hung from its corner
      const sh = k.H * .5, sw2 = sh * .3, scx = k.hB[0] - .5 * u, scy = k.hB[1] - sh * .12;
      k.add(5, 'armB', dsteel, rrect(scx - sw2, scy - sh * .5, sw2 * 2, sh, 1.5), { bev: .8 });
      const face2 = k.add(5.1, 'armB', ash, rrect(scx - sw2 + k.U(1.3), scy - sh * .5 + k.U(1.3), sw2 * 2 - k.U(2.6), sh - k.U(2.6), 1), { bev: .8, sep: 1 });
      k.add(5.2, 'armB', teal, R(scx - k.U(.8), scy - sh * .5, k.U(1.6), sh), { clip: face2 });
      k.add(5.21, 'armB', teal, R(scx - sw2, scy - sh * .18, sw2 * 2, k.U(1.6)), { clip: face2 });
      const hkX = scx + sw2 + k.U(1), hkY = scy - sh * .5 + k.U(2);
      k.add(5.4, 'armB', dsteel, R(scx + sw2 - k.U(1), hkY - k.U(.5), k.U(4), k.U(1.1)));
      const ls = k.H * .085, lx = hkX + k.U(1.5);
      k.add(5.45, 'armB', dsteel, P(lx - ls * .6, hkY + ls * .5, lx + ls * .6, hkY + ls * .5, lx + ls * .4, hkY + k.U(.5), lx - ls * .4, hkY + k.U(.5)));
      k.add(5.5, 'armB', light, R(lx - ls * .45, hkY + ls * .5, ls * .9, ls * 1.1), { lr: 22, pulse: 1 });
      k.add(5.55, 'armB', dsteel, R(lx - ls * .6, hkY + ls * 1.6, ls * 1.2, k.U(1)));
      // front arm, pauldron and flanged mace (the role weapon)
      arm(k, 'F', ashD, lea, { bracer: steel, cuff: lea, big: 1.08 });
      const hl = k.H * .32, hr = 1.7;
      k.held(7, 'F', .35, [
        [wood, R(-k.U(.8), -hl, k.U(1.6), hl + k.U(3))],
        [w.P, P(0, -hl - hr * 1.7, hr, -hl - hr * .7, hr * 1.3, -hl + hr * .3, 0, -hl + hr * .8, -hr * 1.3, -hl + hr * .3, -hr, -hl - hr * .7), { bev: .7 }],
        [w.r >= 1 ? w.R : w.D, E(0, k.U(3.2), k.U(1.1), k.U(1.1))],
        w.G ? [w.G, Q(0, -hl - hr * .5, 1, 1), { nl: 1, lr: 7 }] : null
      ]);
      k.add(6.3, 'armF', dsteel, E(k.pF[0] + .5 * u, k.pF[1] + k.armR * 1.2, k.armR * 1.5, k.armR * .9));
      k.add(6.4, 'armF', steel, E(k.pF[0] + .3 * u, k.pF[1] - .1 * u, k.armR * 1.75, k.armR * 1.35));
    } };

  // ---------------- Ser Aldric Vane, the Oathbound (Rare tank) ----------------
  AK.CHARS.aldric = { name: 'Aldric', circle: 'oath', hs: 1.02, ws: 1.2, aF: -.28, aB: -.5, anim: 'bash', eye: '#2A1E1A',
    wpn: { fam: 'ore', fam2: 'hide', t: 2, r: 1 },
    build(k, w) {
      const u = k.u;
      const silver = m('#B8BECC', 'metal'), iron = m('#6E7688', 'metal'), crim = m('#9E2E3A'), gold = m('#E0AE44', 'metal'), lea = m('#5A3A2A', 'leather'), skin = m(SKINS[0], 'skin'), hair = m('#4A3A30', 'hair'), tr = m('#3A3040');
      legs(k, tr, silver, { greave: silver, sole: iron });
      arm(k, 'B', iron, silver, { cuff: silver, big: 1.1 });
      k.add(1.3, 'armB', silver, E(k.pB[0] - .3 * u, k.pB[1] - .2 * u, k.armR * 1.8, k.armR * 1.45));
      // full plate: breastplate, faulds, a crimson tabard with a gold lantern sigil
      k.add(3, 'up', silver, torsoShape(k, { bot: k.hiY + k.legR * .6 }), { bev: 1.2 });
      k.add(3.05, 'up', iron, P(-k.hipW * 1.15, k.waY + .5, k.hipW * 1.15, k.waY + .5, k.hipW * 1.3, k.hiY * .5, -k.hipW * 1.25, k.hiY * .5));
      const tb = k.add(3.1, 'up', crim, P(-k.sw * .45, k.shY + 1.2 * u, k.sw * .6, k.shY + 1.2 * u, k.sw * .55, k.waY, k.hipW * .7, k.hiY * .2, k.hipW * .1, k.hiY * .05, -k.hipW * .55, k.hiY * .2, -k.sw * .45, k.waY), { bev: 1 });
      k.add(3.12, 'up', gold, R(-20, k.shY + 1.2 * u, 40, k.U(1)), { clip: tb });
      const ex = k.sw * .1, ey = k.shY + (k.waY - k.shY) * .45;
      k.add(3.15, 'up', gold, P(ex - 1.2, ey - 1.6, ex + 1.2, ey - 1.6, ex + 1.5, ey + 1.4, ex - 1.5, ey + 1.4));
      k.add(3.16, 'up', m('#FFE9A8', 'glow'), Q(ex - .4, ey - .5, 1, 1), { nl: 1, nolight: 1 });
      belt(k, lea, { buckle: gold, w: 2 });
      k.add(3.8, 'up', silver, E(k.hx - .4 * u, k.shY + .4 * u, k.sw * .5, k.U(2)));
      head(k, skin); face(k, { eye: this.eye, brow: '#3A2A22' });
      const { hx, hy, hw, hh } = k;
      // open-faced helm with a nasal and a tall crimson crest
      const helm = k.add(4.3, 'head', silver, P(hx - hw * 1.15, hy + hh * .85, arcPts(hx - hw * .05, hy + hh * .05, hw * 1.14, hh * 1.14, Math.PI * .96, Math.PI * 1.97, 14), hx + hw * 1.15, hy - hh * .15, hx + hw * .55, hy - hh * .3, hx + hw * .5, hy + hh * .2, hx + hw * .3, hy + hh * .2, hx + hw * .25, hy - hh * .32, hx - hw * .35, hy - hh * .2, hx - hw * .4, hy + hh * .6), { sep: 1 });
      k.add(4.32, 'head', gold, R(hx - hw * 1.3, hy - hh * .45, hw * 2.6, k.U(1)), { clip: helm });
      k.add(4.25, 'head', crim, P(hx - hw * .4, hy - hh * 1.05, hx + hw * .4, hy - hh * 1.2, hx + hw * .1, hy - hh * 1.75, hx - hw * .7, hy - hh * 1.8, hx - hw * 1.6, hy - hh * 1.2, hx - hw * 1.9, hy - hh * .2, hx - hw * 1.3, hy - hh * .7), { bev: .8 });
      // kite shield with a lantern sigil (the role weapon)
      const sh = k.H * .46, sw2 = sh * .34, scx = k.hB[0] - 1.6 * u, scy = k.hB[1] - sh * .2;
      const kite = t => P(scx - sw2 + t, scy - sh * .5 + t, scx + sw2 - t, scy - sh * .5 + t, scx + sw2 - t, scy - sh * .1, scx, scy + sh * .5 - t * 1.4, scx - sw2 + t, scy - sh * .1);
      k.add(5, 'armB', w.r >= 1 ? w.R : w.D, kite(0), { bev: .8 });
      const fld = k.add(5.1, 'armB', crim, kite(k.U(1.2)), { bev: .9, sep: 1 });
      k.add(5.2, 'armB', gold, P(scx - 1.3, scy - sh * .2, scx + 1.3, scy - sh * .2, scx + 1.6, scy + sh * .08, scx - 1.6, scy + sh * .08), { clip: fld });
      k.add(5.25, 'armB', w.G || m('#FFE9A8', 'glow'), Q(Math.round(scx - .5), Math.round(scy - sh * .1), 1, 2), { nl: 1, lr: 8, nolight: !w.G });
      arm(k, 'F', iron, silver, { bracer: silver, cuff: iron, big: 1.1 });
      const bl = k.H * .46, bw = 1.2;
      k.held(7, 'F', .35, [
        [lea, R(-k.U(.8), -k.U(2.5), k.U(1.6), k.U(5))],
        [gold, E(0, k.U(3), k.U(1.2), k.U(1.2))],
        [gold, P(-k.U(3.2), -k.handR - k.U(.3), k.U(3.2), -k.handR - k.U(.3), k.U(2.8), -k.handR - k.U(1.6), -k.U(2.8), -k.handR - k.U(1.6))],
        [w.P, P(-bw, -k.handR - k.U(1.5), bw, -k.handR - k.U(1.5), bw * .9, -bl + bw * 2, 0, -bl, -bw * .9, -bl + bw * 2), { bev: .6 }]
      ]);
      k.add(6.3, 'armF', silver, E(k.pF[0] + .6 * u, k.pF[1] + k.armR * 1.3, k.armR * 1.6, k.armR * .95));
      const pd = k.add(6.4, 'armF', silver, E(k.pF[0] + .3 * u, k.pF[1] - .1 * u, k.armR * 1.9, k.armR * 1.5));
      k.add(6.45, 'armF', gold, R(k.pF[0] - 10, k.pF[1] + k.armR * .75, 20, k.U(1)), { clip: pd });
    } };

  // ---------------- Brother Anselm, the Bellringer (Rare support) ----------------
  AK.CHARS.anselm = { name: 'Anselm', circle: 'oath', hs: .9, ws: 1.3, hd: 1.04, aF: -.5, aB: -.3, anim: 'swing', eye: '#2E2018',
    wpn: { fam: 'ore', fam2: 'wood', t: 1, r: 1 },
    build(k, w) {
      const u = k.u;
      const habit = m('#6A4A30'), cowl = m('#4E3422'), bronze = m('#C8903E', 'metal'), rope = m('#C8B890', 'leather'), skin = m(SKINS[0], 'skin'), hair = m('#6A4A30', 'hair'), boot = m('#4A3428', 'leather');
      // the great bell strapped to his back, taller than his head
      const bx = -k.sw * .9, by = k.shY - 3;
      k.add(.1, 'up', bronze, E(bx, by - 8.2, 1.3, 1.1));
      k.add(.2, 'up', bronze, P(bx - 3, by - 7.5, bx + 3, by - 7.5, bx + 4, by - 3, bx + 4.6, by + 3.4, bx + 6.4, by + 5.2, bx - 6.4, by + 5.2, bx - 4.6, by + 3.4, bx - 4, by - 3), { bev: 1.2 });
      k.add(.25, 'up', m('#8A5A2A', 'metal'), R(bx - 6.4, by + 3.2, 12.8, 1.1));
      k.add(.26, 'up', m('#3A2A20', 'flat'), E(bx, by + 5.4, 5, .9), { nl: 1 });
      legs(k, m('#4A3A30'), boot, {});
      arm(k, 'B', habit, skin, { bell: habit });
      // round brown habit with a rope belt and a fallen cowl
      k.add(3, 'up', habit, robeShape(k, { hem: -k.bootH * .5, flare: 1.05 }), { bev: 1.3 });
      k.add(3.3, 'up', rope, R(-k.sw * .95, k.waY - k.U(.8), k.sw * 1.9, k.U(1.6)));
      k.add(3.32, 'up', rope, P(k.sw * .35, k.waY + k.U(.5), k.sw * .6, k.waY + k.U(.5), k.sw * .55, k.waY + k.U(8), k.sw * .3, k.waY + k.U(8)));
      k.add(3.35, 'up', m('#5A3E2A', 'leather'), P(-k.sw * .95, k.shY + 1, -k.sw * .6, k.shY + .3, k.sw * .7, k.waY - .6, k.sw * .4, k.waY + .6));
      k.add(3.7, 'up', cowl, P(-k.sw * 1.1, k.shY + 1.4, arcPts(0, k.shY + 1, k.sw * 1.05, 2.4, Math.PI, Math.PI * 2, 6), k.sw * 1.05, k.shY + 1.6, k.sw * .3, k.shY + 3.6, -k.sw * .8, k.shY + 3.4), { bev: 1 });
      head(k, skin); face(k, { eye: this.eye, brow: '#5A3A22' });
      hairFringe(k, hair);
      // the handbell (role weapon)
      arm(k, 'F', habit, skin, { bell: habit });
      k.held(7, 'F', .1, [
        [m('#6E4A30', 'wood'), R(-.6, -4.5, 1.2, 3.6)],
        [w.P, P(-2.6, 2.4, 2.6, 2.4, 1.8, -.2, 1.2, -1.2, -1.2, -1.2, -1.8, -.2), { bev: .7 }],
        [w.r >= 1 ? w.R : w.D, R(-2.6, 1.6, 5.2, 1)],
        [w.G || m('#3A2A20', 'flat'), Q(0, 2.6, 1, 1), { nl: 1, lr: 7 }]
      ]);
    } };

  // ---------------- Saint Elowen, the Last Lantern (Legendary support) ----------------
  AK.CHARS.elowen = { name: 'Elowen', circle: 'oath', hs: 1.04, ws: .92, aF: -.75, aB: -.9, anim: 'lift', eye: '#5A3A2A',
    wpn: { fam: 'crystal', fam2: 'ore', t: 2, r: 1 },
    build(k, w) {
      const u = k.u;
      const cream = m('#E8DCC0'), dress = m('#F4ECD8'), gold = m('#E6B84E', 'metal'), rope = m('#C0A070', 'leather'), skin = m(SKINS[0], 'skin'), hair = m('#E2C07A', 'hair'), halo = m('#FFE6A0', 'glow', { light: '#FFD890' });
      const glass = w.r >= 2 ? w.L : m('#FFE09A', 'glow', { light: '#FFC878' });
      const { hx, hy, hw, hh } = k;
      // halo ring behind the head
      k.add(.1, 'head', halo, ringP(hx - hw * .4, hy - hh * .25, hw * 1.35, hh * 1.4, 1), { lr: 30, pulse: 1 });
      legs(k, dress, rope, {});
      arm(k, 'B', cream, skin, { bell: cream, bellTrim: gold });
      const hem = -k.U(.5);
      const dr = k.add(3, 'up', dress, P(-k.sw * .8, k.shY, k.sw * .84, k.shY, k.sw, k.shY + 2 * u, k.sw * .75, k.waY, k.hipW * 1.3, k.hiY * .3, k.hipW * 1.7, hem, -k.hipW * 1.65, hem, -k.hipW * 1.25, k.hiY * .3, -k.sw * .75, k.waY, -k.sw, k.shY + 2 * u), { bev: 1.2 });
      k.add(3.05, 'up', gold, R(-30, hem - k.U(1.6), 60, k.U(1.6)), { clip: dr });
      // gold stole down the front
      const sx = k.sw * .25;
      k.add(3.2, 'up', gold, P(sx - k.U(.9), k.shY + 1 * u, sx + k.U(1.1), k.shY + 1 * u, sx + k.U(1.5), hem - k.U(3), sx - k.U(.6), hem - k.U(3)));
      k.add(3.3, 'up', rope, R(-k.sw * .8, k.waY - k.U(.8), k.sw * 1.6, k.U(1.6)));
      k.add(3.32, 'up', rope, P(-k.sw * .3, k.waY + k.U(.5), -k.sw * .1, k.waY + k.U(.5), -k.sw * .05, k.waY + k.U(6), -k.sw * .35, k.waY + k.U(6)));
      // face, hair strands, hood up
      head(k, skin); face(k, { eye: this.eye, brow: '#B89050' });
      k.add(4.2, 'head', hair, P(hx - hw * .4, hy - hh * .75, hx + hw * .95, hy - hh * .7, hx + hw * .75, hy - hh * .3, hx + hw * .3, hy - hh * .45, hx + hw * .1, hy + hh * .2, hx - hw * .15, hy + hh * 1.3, hx - hw * .45, hy + hh * .8));
      hood(k, cream, {});
      // mantle over the shoulders with a gold border
      const mt = k.add(3.6, 'up', cream, P(-k.sw * 1.15, k.shY + 3 * u, arcPts(0, k.shY + 2 * u, k.sw * 1.12, 3.5 * u, Math.PI, Math.PI * 2, 6), k.sw * 1.15, k.shY + 3 * u, k.sw * 1.1, k.shY + (k.waY - k.shY) * .6, -k.sw * 1.15, k.shY + (k.waY - k.shY) * .6), { bev: 1.1 });
      k.add(3.62, 'up', gold, R(-20, k.shY + (k.waY - k.shY) * .6 - k.U(1.4), 40, k.U(1.4)), { clip: mt });
      // front arm and the lantern held in both hands (the role weapon: glass by tier from Epic)
      arm(k, 'F', cream, skin, { bell: cream, bellTrim: gold });
      const ls = k.H * .13;
      k.held(7, 'F', -.1, [
        [gold, R(-k.U(.5), -k.U(1), k.U(1), ls * .45)],
        [gold, P(-ls * .7, ls * .5, ls * .7, ls * .5, ls * .45, ls * .15, -ls * .45, ls * .15)],
        [glass, R(-ls * .55, ls * .5, ls * 1.1, ls * 1.2), { lr: 34, pulse: 1 }],
        [gold, P(-ls * .75, ls * 1.7, ls * .75, ls * 1.7, ls * .5, ls * 1.7 + k.U(2), -ls * .5, ls * 1.7 + k.U(2))]
      ]);
    } };

  // ---------------- Caedmon the Unburnt, the Ashen Knight (Legendary tank) ----------------
  AK.CHARS.caedmon = { name: 'Caedmon', circle: 'oath', hs: 1.1, ws: 1.14, aF: -.28, aB: -.5, anim: 'bash', eye: '#FFD070',
    wpn: { fam: 'ore', fam2: 'hide', t: 5, r: 3 },
    build(k, w) {
      const u = k.u;
      const plate = m('#3E3236', 'metal'), plateD = m('#2A2226', 'metal'), ash = m('#7A7070'), seam = m('#FF8A3A', 'glow', { light: '#FF7A2E' }), lea = m('#3A2A26', 'leather');
      const seamS = (z, bone, s) => k.add(z, bone, seam, s, { nl: 1, nolight: 1 });
      // burnt, tattered cloak behind
      k.add(.2, 'up', m('#2E2426'), P(-k.sw * .9, k.shY, k.sw * .4, k.shY, -k.hipW * .2, k.hiY * .2, -k.hipW * .7, -2, -k.hipW * 1.1, k.hiY * .1, -k.hipW * 1.6, -1, -k.hipW * 2, k.hiY * .3, -k.sw * 1.15, k.waY), { bev: 1 });
      legs(k, plateD, plate, { greave: plate, sole: plateD });
      seamS(2.2, 'legs', R(k.fx + .2, k.hiY * .6, .8, 3));
      arm(k, 'B', plateD, plate, { cuff: plate, big: 1.1 });
      k.add(1.3, 'armB', plate, E(k.pB[0] - .3 * u, k.pB[1] - .2 * u, k.armR * 1.9, k.armR * 1.5));
      // charred plate with glowing seams, an ash tabard
      k.add(3, 'up', plate, torsoShape(k, { bot: k.hiY + k.legR * .6 }), { bev: 1.2 });
      const tb = k.add(3.1, 'up', ash, P(-k.hipW * .7, k.waY + .5, k.hipW * .8, k.waY + .5, k.hipW * .9, k.hiY * .25, k.hipW * .3, k.hiY * .1, -k.hipW * .2, k.hiY * .3, -k.hipW * .8, k.hiY * .2), { bev: .9 });
      seamS(3.2, 'up', P(-k.sw * .5, k.shY + 1.2, -k.sw * .3, k.shY + 1.2, k.sw * .1, k.shY + 4.4, -k.sw * .2, k.waY - 1, -k.sw * .4, k.waY - 1, -k.sw * .05, k.shY + 4.6));
      seamS(3.2, 'up', R(k.sw * .55, k.shY + 1.5, .8, 2.4));
      belt(k, lea, { buckle: ash, w: 2 });
      k.add(3.8, 'up', plate, E(k.hx - .4 * u, k.shY + .4 * u, k.sw * .52, k.U(2.1)));
      head(k, m(SKINS[2], 'skin'));
      const { hx, hy, hw, hh } = k;
      // flat-topped great helm, ember eyes behind the slit, a charred crest
      k.add(.5, 'head', ash, P(hx - hw * .2, hy - hh * 1.1, hx - hw * .6, hy - hh * 1.6, hx - hw * 1.5, hy - hh * 1.4, hx - hw * 2.1, hy - hh * .5, hx - hw * 1.6, hy - hh * .75, hx - hw * .9, hy - hh * .9));
      const helm = k.add(4.3, 'head', plate, P(hx - hw * 1.12, hy + hh * 1.05, hx - hw * 1.2, hy - hh * .6, hx - hw * .7, hy - hh * 1.2, hx + hw * .8, hy - hh * 1.2, hx + hw * 1.2, hy - hh * .7, hx + hw * 1.25, hy + hh * .6, hx + hw * .9, hy + hh * 1.1), { bev: 1, sep: 1 });
      k.add(4.32, 'head', m('#07050B', 'flat'), R(hx - hw * .1, hy - hh * .25, hw * 1.4, k.U(1.2)), { clip: helm, nl: 1 });
      k.add(4.35, 'head', m('#FFD070', 'glow', { light: '#FF9A40' }), Q(Math.round(hx + hw * .5), Math.round(hy - hh * .25), 1, 1), { nl: 1, lr: 8, pulse: 1 });
      seamS(4.34, 'head', R(hx - hw * .6, hy - hh * 1.1, .8, hh * .9));
      // greatshield split by a burning crack (the role weapon)
      const sh = k.H * .5, sw2 = sh * .36, scx = k.hB[0] - 1.5 * u, scy = k.hB[1] - sh * .2;
      const gs = t => P(scx - sw2 + t, scy - sh * .5 + t, scx + sw2 - t, scy - sh * .5 + t, scx + sw2 - t, scy + sh * .05, scx + sw2 * .5 - t * .7, scy + sh * .35 - t * .4, scx, scy + sh * .5 - t * 1.2, scx - sw2 * .5 + t * .7, scy + sh * .35 - t * .4, scx - sw2 + t, scy + sh * .05);
      k.add(5, 'armB', w.r >= 1 ? m('#8A7A70', 'metal') : plateD, gs(0), { bev: .8 });
      const fld = k.add(5.1, 'armB', m('#2E2426', 'metal'), gs(k.U(1.2)), { bev: .9, sep: 1 });
      k.add(5.2, 'armB', w.G || seam, P(scx - .4, scy - sh * .5, scx + .8, scy - sh * .5, scx - .2, scy - sh * .15, scx + .9, scy + sh * .15, scx - .1, scy + sh * .5, scx - .9, scy + sh * .5, scx + .1, scy + sh * .15, scx - .9, scy - sh * .15), { clip: fld, nl: 1, lr: 16, pulse: 1 });
      arm(k, 'F', plateD, plate, { bracer: plate, cuff: plateD, big: 1.1 });
      const bl = k.H * .5, bw = 1.2;
      k.held(7, 'F', .35, [
        [lea, R(-k.U(.8), -k.U(2.5), k.U(1.6), k.U(5))],
        [ash, P(-k.U(3.2), -k.handR - k.U(.3), k.U(3.2), -k.handR - k.U(.3), k.U(2.8), -k.handR - k.U(1.6), -k.U(2.8), -k.handR - k.U(1.6))],
        [plate, P(-bw, -k.handR - k.U(1.5), bw, -k.handR - k.U(1.5), bw * .9, -bl + bw * 2, 0, -bl, -bw * .9, -bl + bw * 2), { bev: .6 }],
        [seam, R(-.4, -bl + 3, .8, bl * .6), { nl: 1, nolight: 1 }]
      ]);
      k.add(6.3, 'armF', plate, E(k.pF[0] + .6 * u, k.pF[1] + k.armR * 1.3, k.armR * 1.6, k.armR * .95));
      k.add(6.4, 'armF', plate, E(k.pF[0] + .3 * u, k.pF[1] - .1 * u, k.armR * 1.9, k.armR * 1.5));
      seamS(6.45, 'armF', R(k.pF[0] - .2, k.pF[1] - 1.4, .8, 2.2));
    } };
}
