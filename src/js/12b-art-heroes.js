// 12b-art-heroes: the four hero classes in B1 (Warden, Lanternmage, Ranger, Lightkeeper) and their
// gear drawings per slot. DATA only (no DOM). Kit and rules: 12a-art-body.js, docs/design/art-direction.md.
//
// build(k, g, look): g.weapon | g.off | g.head | g.body | g.charm are gear material sets
// (AK.gearMats) or null when the slot is empty; look = { skin, hair } materials.
// Tier changes the gear's material (copper, iron, mithril...), rarity adds trim (Rare: gold),
// glow (Epic) and a pulse (Legendary). Every class keeps its own colours whatever the gear.
{
  const { m, mix, lift, E, P, C, R, Q, arcPts, rrect, legs, torsoShape, robeShape, arm, head, face, hairShort, hairFringe, hood, belt, lanternItems, GOLD } = AK;
  const trimOf = g => g && g.r >= 1 ? g.R : m('#A88450', 'metal');
  // Charm: a cord and a small crystal at the collar.
  function charm(k, c, x, y) {
    if (!c) return;
    k.add(3.85, 'up', m('#C8A870', 'metal'), R(x - k.U(.5), y - k.U(1.6), k.U(.8), k.U(1.6)), { nl: 1 });
    k.add(3.86, 'up', c.C, Q(Math.round(x - .5), Math.round(y), 1, 1), { nl: 1, lr: 6 });
  }
  // A lantern on the hip (the hero always carries one unless it is in hand).
  // acc tags and k.lamp: the Lantern and Flame looks (12g) swap or tint it.
  function hipLantern(k, x) {
    const d = m('#4E4452', 'metal'), lamp = m('#FFD27A', 'glow', { light: '#FFC070' });
    k.add(3.41, 'up', d, R(x - k.U(.4), k.waY + k.U(1.2), k.U(.8), k.U(1.6)), { acc: 'lamp' });
    k.add(3.42, 'up', d, R(x - k.U(1.4), k.waY + k.U(2.8), k.U(2.8), k.U(1)), { acc: 'lamp' });
    k.add(3.43, 'up', lamp, R(x - k.U(1.2), k.waY + k.U(3.6), k.U(2.4), k.U(3)), { lr: 16, pulse: 1, acc: 'glass' });
    k.add(3.44, 'up', d, R(x - k.U(1.4), k.waY + k.U(6.4), k.U(2.8), k.U(.9)), { acc: 'lamp' });
    k.lamp = { at: 'hip', x };
  }

  // ---------------- Warden: knight with warblade and heater shield ----------------
  AK.CLASSES.warden = { name: 'Warden', hs: 1, ws: 1.1, aF: -.28, aB: -.5, anim: 'slash', eye: '#3A2A22',
    slots: { weapon: { fam: 'ore', fam2: 'hide' }, off: { fam: 'ore', fam2: 'hide' }, head: { fam: 'ore' }, body: { fam: 'ore', fam2: 'hide' }, charm: { fam: 'crystal' } },
    build(k, g, L) {
      const u = k.u, b = g.body, w = g.weapon, o = g.off, hd = g.head;
      const plate = b ? b.P : m('#A8B2C4', 'metal'), plateD = b ? b.D : m('#6E7A92', 'metal'), mail = m('#7A8296', 'metal');
      const blue = m('#2F57B0'), gold = m(GOLD, 'metal'), trim = trimOf(b), lea = m('#7A4E2E', 'leather'), dlea = m('#4E3226', 'leather'), tr = m('#3E3848'), plume = m('#C8463C');
      legs(k, tr, plate, { greave: plate, sole: plateD });
      // back arm, pauldron
      arm(k, 'B', mail, plate, { cuff: plate, big: 1.1 });
      k.add(1.3, 'armB', plate, E(k.pB[0] - .3 * u, k.pB[1] - .2 * u, k.armR * 1.8, k.armR * 1.45));
      // mail under a blue surcoat with a trim hem
      k.add(3, 'up', mail, torsoShape(k, { bot: k.hiY + k.legR * .8 }));
      const sc = k.add(3.1, 'up', blue, P(-k.sw * .78, k.shY + .6 * u, k.sw * .84, k.shY + .6 * u, k.sw * .86, k.waY, k.hipW * 1.25, k.hiY * .42, k.hipW * .2, k.hiY * .42, k.hipW * .02, k.hiY * .58, -k.hipW * .15, k.hiY * .42, -k.hipW * 1.18, k.hiY * .42, -k.sw * .8, k.waY), { bev: 1.2 });
      k.add(3.12, 'up', trim, R(-20, k.hiY * .42 - k.U(1.4), 40, k.U(1.4)), { clip: sc });
      // gold lantern emblem on the chest (glowing from Epic body armour)
      const ex = k.sw * .2, ey = k.shY + (k.waY - k.shY) * .42, es = .8;
      k.add(3.15, 'up', gold, P(ex - 1.6 * es, ey - 2 * es, ex + 1.6 * es, ey - 2 * es, ex + 2 * es, ey + 1.8 * es, ex - 2 * es, ey + 1.8 * es));
      k.add(3.16, 'up', b && b.G ? b.G : m('#FFE9A8', 'glow'), Q(ex - .4, ey - .5, 1, 1), { nl: 1, nolight: !(b && b.G), lr: 8 });
      // belt, buckle, hip lantern
      belt(k, lea, { buckle: gold, w: 2.3, x: k.sw * .1 });
      k.add(3.4, 'up', dlea, R(-k.hipW * .95, k.waY + k.U(1), k.U(1.1), k.U(2.5)));
      hipLantern(k, -k.hipW * .95);
      // gorget
      k.add(3.8, 'up', plate, E(k.hx - .4 * u, k.shY + .4 * u, k.sw * .52, k.U(2.1)));
      charm(k, g.charm, k.hx + .8, k.shY + 1.6);
      head(k, L.skin); face(k, { eye: this.eye, brow: '#4A2E20' });
      const { hx, hy, hw, hh } = k;
      if (hd) {
        // sallet helm with a ridge; plume from Rare
        const yb = hy - hh * .16;
        const helm = k.add(4.3, 'head', hd.P, P(hx - hw * 1.2, hy + hh * .78, arcPts(hx - hw * .05, hy + hh * .05, hw * 1.14, hh * 1.14, Math.PI * .96, Math.PI * 1.97, 14), hx + hw * 1.22, yb, hx + hw * .3, yb, hx - hw * .15, yb + hh * .1, hx - hw * .45, hy + hh * .45), { sep: 1 });
        k.add(4.32, 'head', hd.r >= 1 ? hd.R : hd.D, R(hx - hw * .2 - k.U(1), hy - hh * 1.4, k.U(2), hh * 1.3), { clip: helm });
        if (hd.G) k.add(4.34, 'head', hd.G, Q(Math.round(hx + hw * .1), Math.round(hy - hh * .75), 1, 1), { nl: 1, lr: 6 });
        if (hd.r >= 1) k.add(.6, 'head', plume, P(hx - hw * .3, hy - hh * 1.05, hx - hw * .2, hy - hh * 1.45, hx - hw * .8, hy - hh * 1.5, hx - hw * 1.55, hy - hh * .9, hx - hw * 1.7, hy - hh * .05, hx - hw * 1.3, hy - hh * .55, hx - hw * .7, hy - hh * .95));
      } else hairShort(k, L.hair);
      // heater shield on the back arm
      if (o) {
        const sh = k.H * .4, sw2 = sh * .4, scx = k.hB[0] - 2.2 * u, scy = k.hB[1] - sh * .25;
        const shp = t => P(scx - sw2 + t, scy - sh * .5 + t, scx + sw2 - t, scy - sh * .5 + t, scx + sw2 - t, scy - sh * .05, scx + sw2 * .45 - t * .7, scy + sh * .32 - t * .4, scx, scy + sh * .5 - t * 1.2, scx - sw2 * .45 + t * .7, scy + sh * .32 - t * .4, scx - sw2 + t, scy - sh * .05);
        k.add(5, 'armB', o.r >= 1 ? o.R : o.D, shp(0), { bev: .8 });
        const field = k.add(5.1, 'armB', o.P, shp(k.U(1.2)), { bev: .9, sep: 1 });
        k.add(5.2, 'armB', blue, R(scx - k.U(1), scy - sh * .5, k.U(2), sh), { clip: field });
        k.add(5.21, 'armB', blue, R(scx - sw2, scy - sh * .16, sw2 * 2, k.U(2)), { clip: field });
        k.add(5.3, 'armB', o.G || m('#FFD98A', 'glow'), E(scx, scy - sh * .1, k.U(1.2), k.U(1.3)), { lr: o.G ? 10 : 7, nolight: !o.G, pulse: o.pulse });
      }
      // front arm: mail sleeve, vambrace, gauntlet; warblade; big pauldron
      arm(k, 'F', mail, plate, { bracer: plate, cuff: plateD, big: 1.1 });
      if (w) {
        const bl = k.H * .5, bw = 1.2;
        k.held(7, 'F', .35, [
          [w.Q, R(-k.U(.8), -k.U(2.5), k.U(1.6), k.U(5))],
          [w.R, E(0, k.U(3), k.U(1.2), k.U(1.2))],
          [w.r >= 1 ? w.R : w.D, P(-k.U(3.4), -k.handR - k.U(.3), k.U(3.4), -k.handR - k.U(.3), k.U(3), -k.handR - k.U(1.7), -k.U(3), -k.handR - k.U(1.7))],
          [w.P, P(-bw, -k.handR - k.U(1.6), bw, -k.handR - k.U(1.6), bw * .9, -bl + bw * 2, 0, -bl, -bw * .9, -bl + bw * 2), { bev: .6 }],
          w.G ? [w.G, R(-.4, -bl + bw * 3, .8, bl * .55), { nl: 1, lr: 10, pulse: w.pulse }] : null
        ]);
      }
      k.add(6.3, 'armF', plate, E(k.pF[0] + .6 * u, k.pF[1] + k.armR * 1.3, k.armR * 1.6, k.armR * .95));
      const pd = k.add(6.4, 'armF', plate, E(k.pF[0] + .3 * u, k.pF[1] - .1 * u, k.armR * 1.85, k.armR * 1.45));
      k.add(6.45, 'armF', trim, R(k.pF[0] - 10, k.pF[1] + k.armR * .75, 20, k.U(1.1)), { clip: pd });
    } };

  // ---------------- Lanternmage: robed caster with staff and lantern ----------------
  AK.CLASSES.lanternmage = { name: 'Lanternmage', hs: 1, ws: 1, aF: -.3, aB: -.25, anim: 'cast', eye: '#3A2A22',
    slots: { weapon: { fam: 'wood', fam2: 'crystal' }, off: { fam: 'crystal', fam2: 'ore' }, head: { fam: 'crystal' }, body: { fam: 'fibre', dye: '#6A46AE', dyeAmt: .78 }, charm: { fam: 'crystal' } },
    build(k, g, L) {
      const u = k.u, b = g.body, w = g.weapon, o = g.off, hd = g.head;
      const robe = b ? b.P : m('#6A46AE'), robeD = m('#3C2A5C'), lilac = m('#C4ACEA'), gold = trimOf(b), sash = m('#E0783A'), lea = m('#6E4A30', 'leather');
      legs(k, m('#3A3040'), lea, {});
      arm(k, 'B', robe, L.skin, { bell: robe, bellTrim: gold });
      // long robe with a lilac front panel and a trim hem
      const hem = -k.bootH * .55;
      const rb = k.add(3, 'up', robe, robeShape(k, { hem }), { bev: 1.2 });
      k.add(3.05, 'up', lilac, P(k.hipW * .1, k.waY, k.hipW * .75, k.waY, k.hipW * 1.25, hem, -k.hipW * .15, hem), { clip: rb });
      k.add(3.1, 'up', gold, R(-20, hem - k.U(1.6), 40, k.U(1.6)), { clip: rb });
      k.add(3.12, 'up', gold, P(k.hipW * .1 - k.U(.5), k.waY, k.hipW * .1 + k.U(.6), k.waY, -k.hipW * .15 + k.U(.6), hem, -k.hipW * .15 - k.U(.5), hem), { clip: rb });
      if (b && b.G) k.add(3.13, 'up', b.G, Q(Math.round(k.hipW * .45), Math.round(k.hiY * .35), 1, 1), { nl: 1, lr: 7 });
      // ember sash with a knot and a tail, a pouch at the back hip
      k.add(3.3, 'up', sash, R(-k.sw * .82, k.waY - k.U(1.1), k.sw * 1.66, k.U(2.4)));
      k.add(3.32, 'up', sash, P(k.sw * .35, k.waY + k.U(1), k.sw * .6, k.waY + k.U(1), k.sw * .7, k.waY + k.U(6.5), k.sw * .48, k.waY + k.U(6)));
      k.add(3.34, 'up', sash, E(k.sw * .45, k.waY + k.U(.2), k.U(1.5), k.U(1.4)), { sep: 1 });
      k.add(3.36, 'up', lea, rrect(-k.sw * .95, k.waY + k.U(1.2), k.U(3.2), k.U(3.4), k.U(1)));
      if (!o) hipLantern(k, -k.sw * .2);
      // hair (long), face, circlet
      const hp = head(k, L.skin); face(k, { eye: this.eye });
      hairShort(k, L.hair, { long: 1.3 });
      const { hx, hy, hw, hh } = k;
      if (hd) {
        k.add(4.4, 'head', hd.r >= 1 ? hd.R : hd.silver, R(hx - hw * 1.2, hy - hh * .52, hw * 2.4, k.U(.9)), { clip: hp });
        k.add(4.45, 'head', hd.C, E(hx + hw * .55, hy - hh * .45, k.U(1.1), k.U(1.1)), { lr: 7, pulse: hd.pulse });
      }
      // capelet over the shoulders, trim edge and clasp
      k.add(.4, 'up', robeD, E(hx - hw * .55, k.shY - .4 * u, hw * .75, hh * .45));
      const cp = k.add(3.6, 'up', robeD, P(-k.sw * 1.12, k.shY + 3 * u, arcPts(0, k.shY + 2 * u, k.sw * 1.1, 3.5 * u, Math.PI, Math.PI * 2, 6), k.sw * 1.15, k.shY + 3 * u, k.sw * .9, k.shY + (k.waY - k.shY) * .6, k.sw * .2, k.shY + (k.waY - k.shY) * .72, -k.sw * .5, k.shY + (k.waY - k.shY) * .62), { bev: 1.1 });
      k.add(3.62, 'up', gold, P(-k.sw * 1.2, k.shY + (k.waY - k.shY) * .55, k.sw * .2, k.shY + (k.waY - k.shY) * .64, k.sw * 1.2, k.shY + (k.waY - k.shY) * .52, k.sw * 1.2, k.shY + (k.waY - k.shY) * .8, -k.sw * 1.2, k.shY + (k.waY - k.shY) * .8), { clip: cp });
      k.add(3.7, 'up', gold, E(k.sw * .25, k.shY + 1.8 * u, k.U(1.3), k.U(1.3)));
      charm(k, g.charm, k.sw * .25, k.shY + 3.4);
      // lantern hanging from the back hand
      if (o) {
        const items = lanternItems(k.H * .1, o.Q, o.L, { lr: 22 });
        if (o.r >= 1) items.push([o.R, R(-k.H * .055, k.H * .045 - .2, k.H * .11, .9), { acc: 'lamp' }]);
        k.held(5, 'B', 0, items);
        k.lamp = { at: 'held', side: 'B', z: 5, s: k.H * .1, glass: o.L };
      }
      // front arm and staff
      arm(k, 'F', robe, L.skin, { bell: robe, bellTrim: gold });
      if (w) {
        const up = k.H * .72, dn = k.H * .26;
        const gem = w.r >= 2 ? w.C : m('#FF9A4A', 'glow', { light: '#FFB060' });
        k.held(5.9, 'F', .05, [
          [w.P, R(-k.U(.8), -up, k.U(1.6), up + dn)],
          [w.r >= 1 ? w.R : w.D, R(-k.U(1.1), -up + k.U(3), k.U(2.2), k.U(1.2))],
          [w.P, P(-k.U(.8), -up + k.U(1), -k.U(2.6), -up - k.U(2.5), -k.U(1), -up - k.U(5.2), k.U(2.2), -up - k.U(5), k.U(2.8), -up - k.U(2.2), k.U(1.2), -up - k.U(1), k.U(.8), -up + k.U(1))],
          [gem, E(k.U(.1), -up - k.U(2.6), k.U(1.5), k.U(1.8)), { lr: 13, pulse: w.pulse }]
        ]);
      }
    } };

  // ---------------- Ranger: hooded archer with a longbow and a quiver ----------------
  AK.CLASSES.ranger = { name: 'Ranger', hs: 1, ws: 1, aF: -.1, aB: -.85, anim: 'shoot', eye: '#2E2418',
    slots: { weapon: { fam: 'wood', fam2: 'hide' }, off: { fam: 'hide', fam2: 'wood' }, head: { fam: 'hide', fam2: 'fibre', dye: '#3E6E3A', dyeAmt: .62 }, body: { fam: 'hide', fam2: 'fibre' }, charm: { fam: 'crystal' } },
    build(k, g, L) {
      const u = k.u, b = g.body, w = g.weapon, o = g.off, hd = g.head, po = k.pose;
      const green = m('#3E7A3E'), greenD = m('#2C5230'), jerk = b ? b.P : m('#8A6440', 'leather'), lea = m('#5E3E26', 'leather'), tr = m('#4A4038'), boot = m('#5A3C28', 'leather'), cream = m('#D8C8A0'), trim = trimOf(b);
      // cloak behind (green), falling to the knee
      k.add(.2, 'up', greenD, P(-k.sw * .9, k.shY, k.sw * .4, k.shY, -k.hipW * .3, k.hiY * .35, -k.hipW * 1.5, k.hiY * .25, -k.hipW * 1.9, k.hiY * .55, -k.sw * 1.1, k.waY), { bev: 1, acc: 'back' });
      legs(k, tr, boot, { cuff: lea });
      arm(k, 'B', green, m('#6E4A30', 'leather'), { bracer: lea });
      // green tunic, leather jerkin laced up the front, belt with a pouch
      k.add(3, 'up', green, torsoShape(k, { bot: k.hiY * .5, bw: 1.3 }));
      const jk = k.add(3.1, 'up', jerk, P(-k.sw * .72, k.shY + .8 * u, k.sw * .8, k.shY + .8 * u, k.sw * .82, k.waY, k.hipW * 1.1, k.hiY * .7, -k.hipW * 1.05, k.hiY * .7, -k.sw * .75, k.waY), { bev: 1.1 });
      k.add(3.12, 'up', b ? b.Q : cream, R(k.sw * .18, k.shY + 1.2 * u, k.U(.9), k.waY - k.shY - 1.4 * u), { clip: jk });
      if (b && b.r >= 1) k.add(3.13, 'up', trim, R(-20, k.hiY * .7 - k.U(1.1), 40, k.U(1.1)), { clip: jk });
      if (b && b.G) k.add(3.14, 'up', b.G, Q(Math.round(-k.sw * .35), Math.round(k.shY + 3), 1, 1), { nl: 1, lr: 7 });
      belt(k, lea, { buckle: m('#B89868', 'metal'), w: 2 });
      k.add(3.4, 'up', lea, rrect(k.sw * .35, k.waY + k.U(1), k.U(2.8), k.U(3), k.U(.8)));
      hipLantern(k, -k.hipW * 1.05);
      // quiver on the back, fletching over the shoulder
      if (o) {
        const qx = -k.sw * .6, qy = k.shY + 1;
        k.add(.5, 'up', o.P, P(qx - 2.2, qy - 1, qx + .2, qy - 2.4, qx + 3.6, qy + 10, qx + 1.4, qy + 11.2), { bev: .8 });
        k.add(.52, 'up', o.r >= 1 ? o.R : o.D, P(qx - 2.3, qy + .6, qx + .6, qy - .8, qx + 1, qy + .6, qx - 1.9, qy + 2));
        k.add(.45, 'up', m('#E8E0D0'), P(qx - 3.2, qy - 3.8, qx - 1.6, qy - 5, qx - .4, qy - 1.6, qx - 1.8, qy - 1));
        k.add(.46, 'up', m(o.G ? o.G.hex : '#C84A3C'), P(qx - 1, qy - 4.6, qx + .6, qy - 5.4, qx + 1.2, qy - 2, qx - .4, qy - 1.6));
        k.add(3.35, 'up', lea, P(-k.sw * .9, k.shY + 1, -k.sw * .5, k.shY + .2, k.sw * .8, k.waY - .4, k.sw * .5, k.waY + .6));
      }
      charm(k, g.charm, k.hx + 1, k.shY + 1.6);
      head(k, L.skin); face(k, { eye: this.eye, brow: '#3A2418' });
      if (hd) hood(k, hd.P, { trim: hd.r >= 1 ? hd.R : null });
      else hairShort(k, L.hair);
      // front arm (draws the string)
      arm(k, 'F', green, m('#6E4A30', 'leather'), { cuff: lea });
      // the longbow in the back hand, held upright; wF/wB of 'shoot' keep it upright when raised
      if (w) {
        const bh = k.H * .4, dr = !!po.drawn, pull = dr ? 4.6 : 0;
        const limb = [w.P, P(-.8, -1, .7, -1, 2.8, -bh * .45, 2.4, -bh * .95, .6, -bh - .4, 1.2, -bh * .45, -.8, -1.6)];
        const limbD = [w.P, P(-.8, 1, .7, 1, 2.8, bh * .45, 2.4, bh * .95, .6, bh + .4, 1.2, bh * .45, -.8, 1.6)];
        const items = [limb, limbD, [w.Q, R(-.9, -1.6, 1.8, 3.2)]];
        if (w.r >= 1) items.push([w.R, Q(1, -Math.round(bh) - .5, 1, 1)], [w.R, Q(1, Math.round(bh) - .5, 1, 1)]);
        if (w.G) items.push([w.G, R(1.6, -bh * .7, .7, bh * .3), { nl: 1, lr: 7 }]);
        const str = m('#E8DEC8', 'flat');
        if (!dr) items.push([str, R(1, -bh + .3, .6, bh * 2 - .6), { nl: 1 }]);
        else items.push([str, P(1, -bh + .3, 1.6, -bh + .3, -pull + .6, .3, -pull, .3), { nl: 1 }], [str, P(-pull, -.3, -pull + .6, -.3, 1.6, bh - .3, 1, bh - .3), { nl: 1 }],
          [m('#8A6440', 'wood'), R(-pull, -.5, pull + 7, 1)], [m('#C8CCD4', 'metal'), P(6.6, -1.2, 8.4, 0, 6.6, 1.2)]);
        k.held(5.5, 'B', 0, items);
      }
    } };

  // ---------------- Lightkeeper: priest with a censer and a tome ----------------
  AK.CLASSES.lightkeeper = { name: 'Lightkeeper', hs: 1, ws: 1.02, aF: -.35, aB: -.45, anim: 'swing', eye: '#3A2A22',
    slots: { weapon: { fam: 'ore' }, off: { fam: 'hide', fam2: 'fibre' }, head: { fam: 'fibre', dye: '#EDE4CC', dyeAmt: .8 }, body: { fam: 'fibre', dye: '#EDE4CC', dyeAmt: .82 }, charm: { fam: 'crystal' } },
    build(k, g, L) {
      const u = k.u, b = g.body, w = g.weapon, o = g.off, hd = g.head;
      const robe = b ? b.P : m('#E8DEC6'), crim = m('#A8323E'), gold = trimOf(b), rope = m('#C0A070', 'leather'), boot = m('#6A4A34', 'leather');
      legs(k, m('#4A3E48'), boot, {});
      arm(k, 'B', robe, L.skin, { bell: robe, bellTrim: gold });
      const hem = -k.bootH * .5;
      const rb = k.add(3, 'up', robe, robeShape(k, { hem, flare: .95 }), { bev: 1.2 });
      k.add(3.05, 'up', gold, R(-20, hem - k.U(1.5), 40, k.U(1.5)), { clip: rb });
      // crimson stole down the front with gold ends
      const sx = k.sw * .2;
      k.add(3.2, 'up', crim, P(sx - k.U(1.2), k.shY + .6 * u, sx + k.U(1.3), k.shY + .6 * u, sx + k.U(1.8), hem - k.U(2.5), sx - k.U(.8), hem - k.U(2.5)));
      k.add(3.22, 'up', gold, R(sx - k.U(1), hem - k.U(4.2), k.U(2.8), k.U(1.2)));
      if (b && b.G) k.add(3.23, 'up', b.G, Q(Math.round(sx), Math.round(k.shY + 3.5), 1, 1), { nl: 1, lr: 7 });
      else k.add(3.23, 'up', gold, Q(Math.round(sx), Math.round(k.shY + 3.5), 1, 1), { nl: 1 });
      // rope belt with a tassel
      k.add(3.3, 'up', rope, R(-k.sw * .85, k.waY - k.U(.8), k.sw * 1.7, k.U(1.6)));
      k.add(3.32, 'up', rope, P(-k.sw * .35, k.waY + k.U(.5), -k.sw * .1, k.waY + k.U(.5), -k.sw * .05, k.waY + k.U(5.5), -k.sw * .4, k.waY + k.U(5.5)));
      // short cape (mozzetta) over the shoulders
      const cp = k.add(3.6, 'up', robe, P(-k.sw * 1.12, k.shY + 3 * u, arcPts(0, k.shY + 2 * u, k.sw * 1.1, 3.5 * u, Math.PI, Math.PI * 2, 6), k.sw * 1.15, k.shY + 3 * u, k.sw * 1.05, k.shY + (k.waY - k.shY) * .5, -k.sw * 1.1, k.shY + (k.waY - k.shY) * .5), { bev: 1.1, sep: 1 });
      k.add(3.62, 'up', gold, R(-20, k.shY + (k.waY - k.shY) * .5 - k.U(1.2), 40, k.U(1.2)), { clip: cp });
      charm(k, g.charm, k.hx + .6, k.shY + 1.8);
      head(k, L.skin); face(k, { eye: this.eye, brow: '#6A4A38' });
      const { hx, hy, hw, hh } = k;
      if (hd) {
        // mitre: a tall pointed arch with a gold band up the middle and round the base
        const mt = k.add(4.35, 'head', hd.P, P(hx - hw * 1.02, hy - hh * .3, hx + hw * 1.08, hy - hh * .3, hx + hw * 1.04, hy - hh * 1.3, hx + hw * .8, hy - hh * 2.05, hx + hw * .05, hy - hh * 2.8, hx - hw * .72, hy - hh * 2.05, hx - hw * .96, hy - hh * 1.3), { bev: 1.1, sep: 1 });
        const band = hd.r >= 1 ? hd.R : m('#C09A58', 'metal');
        k.add(4.37, 'head', band, R(hx - hw * 1.3, hy - hh * .78, hw * 2.6, k.U(1.4)), { clip: mt });
        k.add(4.38, 'head', band, R(hx - k.U(.6), hy - hh * 3, k.U(1.3), hh * 2.4), { clip: mt });
        k.add(4.39, 'head', hd.G || crim, Q(Math.round(hx - .5), Math.round(hy - hh * 1.8), 1, 2), { nl: 1, lr: 7, nolight: !hd.G });
        k.add(.6, 'head', crim, P(hx - hw * .9, hy - hh * .3, hx - hw * .55, hy - hh * .3, hx - hw * .75, hy + hh * 1.6, hx - hw * 1.1, hy + hh * 1.5));
      } else hairFringe(k, L.hair);
      // tome in the back hand
      if (o) {
        const bx = k.hB[0] - 1, by = k.hB[1] - 3.6;
        k.add(5, 'armB', o.P, rrect(bx - 3, by - 3, 6.4, 7.4, .8), { bev: .7 });
        k.add(5.05, 'armB', m('#EFE6D0'), R(bx + 2.4, by - 2.4, 1.2, 6.2));
        k.add(5.1, 'armB', o.r >= 1 ? o.R : o.D, R(bx - .8, by - 3, k.U(1.3), 7.4));
        if (o.G) k.add(5.2, 'armB', o.G, Q(Math.round(bx + .5), Math.round(by), 1, 1), { nl: 1, lr: 7 });
        k.add(5.3, 'armB', L.skin, E(k.hB[0], k.hB[1], k.handR * 1.05, k.handR * 1.1), { sep: 1 });
      }
      // front arm and the censer on its chain
      arm(k, 'F', robe, L.skin, { bell: robe, bellTrim: gold });
      if (w) {
        const ch = m('#8C8494', 'metal'), coal = m('#FFB050', 'glow', { light: '#FF9A40' });
        const drop = 7.5, cr = 2.3;
        k.held(7, 'F', -.15, [
          [ch, R(-.35, 0, .7, drop), { nl: 1 }],
          [w.r >= 1 ? w.R : w.D, P(-cr * .7, drop, cr * .7, drop, cr * .45, drop - 1, -cr * .45, drop - 1)],
          [w.P, E(0, drop + cr * .9, cr, cr * .9), { bev: .8 }],
          [coal, R(-cr * .6, drop + .6, cr * 1.2, .9), { lr: 14, pulse: 1, acc: 'flame' }],
          w.G ? [w.G, Q(0, drop + cr * .9, 1, 1), { nl: 1, lr: 8 }] : null
        ]);
      }
    } };
}
