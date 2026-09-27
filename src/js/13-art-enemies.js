// 13-art-enemies: B1 monsters, elders (zone bosses), the raid wyrm and the ore and wood nodes.
// Data plus pure maths only (no DOM, no canvas): it loads in Node. 60b-baker.js bakes a rig with
// enemyFrames(key, variant) through the same passes as the party (3 tones per material, section
// lines, cast shadow, despeckle, 1 art px ink outline), drawn at 2x. Guide: docs/design/art-direction.md.
//
// Exposed: ENEMY_RIGS (one global). Keys: slime, bat, bones, beetle, spore, golem, wraith, wyrm,
//   'node:ore', 'node:wood', plus 'node:crystal', 'node:fibre', 'node:herb' from 11-art-craft.js.
//   Each value: { name, anim, hover, b1: 1, parts(frame, variant) -> kit pieces, box, elderBox? }
//     frame: idle0 | idle1 | wind | strike. box: [x0, y0, x1, y1] art px over every frame (feet at 0).
//   variant: monsters { elder, hue } (hue = zone-cycle shift in degrees), wyrm { gen, hue, S },
//     nodes { tier: 1-5 }. S scales the whole drawing (the stage fits the wyrm to the screen).
//
// Authoring (creatures): src = { name, anim, hover, bones: { name: [pivX, pivY, parent] }, ground,
//   poses: { idle0, idle1, wind, strike }, draw(k, pose) }. Creatures are drawn FACING LEFT (toward
//   the party) in art px with the feet at (0, 0). k.add(z, bone, mat, shape, opt) as in the kit
//   (12a); shapes are AK.E / C / P / R / Q. A pose moves bones ({ rot (radians, clockwise), dx, dy })
//   and the whole figure (bob: down, lean: sideways on non-ground bones, dx), and draw() may read
//   its own numbers (a slime's squash). Materials: k.c(hex, kind) follows the zone hue, k.f(hex, kind)
//   is fixed, k.glow(hex) emits light. Elders: k.elder is true and every piece is scaled by k.S.
// Humanoids (Rattlebones) use the character kit (AK.makeKit, facing right) and are mirrored.
// Sizes next to the ~35 art px party (src.scale applied): slime 24, bat 26 (hovering), beetle 25, spore 32, bones 36,
// wraith 35 (hovering), golem 45. Elders are 1.3x and crowned. Wyrm about 80 x 66 at S = 1.

const ENEMY_RIGS = {};

{
  const { m, E, P, C, R, Q, rotP, arcPts, hueShift, mix, makeKit, ANIMS, shapeBox, legs, arm, torsoShape, belt, head } = AK;
  const ELDER_S = 1.3;
  const INKC = '#1A1420';

  // ---------- the creature kit ----------
  function matKit(k, v) {
    const hue = v.hue || 0, sh = hex => hue ? hueShift(hex, hue) : hex;
    k.c = (hex, kind = 'cloth', x) => m(sh(hex), kind, x);
    k.f = (hex, kind = 'cloth', x) => m(hex, kind, x);
    k.glow = (hex, fixed) => { const h = fixed ? hex : sh(hex); return m(h, 'glow', { light: h }); };
    k.gold = m('#E4B44A', 'metal'); k.ink = m(INKC, 'flat');
    k.gem = m('#FF5A48', 'glow', { light: '#FF7A50' });
    // lit eye or detail: a whole-pixel stamp that glows
    k.eye = (z, bone, x, y, w, h, mat, lr) => k.add(z, bone, mat, Q(x, y, w, h), { nl: 1, lr: lr || 5 });
    return k;
  }
  // mirror (humanoids) and scale a finished shape
  function flipScale(s, S, flip) {
    const fx = flip ? -1 : 1;
    switch (s.t) {
      case 'e': return { t: 'e', cx: s.cx * S * fx, cy: s.cy * S, rx: s.rx * S, ry: s.ry * S, a: s.a * fx };
      case 'c': return { t: 'c', x1: s.x1 * S * fx, y1: s.y1 * S, r1: s.r1 * S, x2: s.x2 * S * fx, y2: s.y2 * S, r2: s.r2 * S };
      case 'p': { const o = []; for (let i = 0; i < s.pts.length; i += 2) o.push(s.pts[i] * S * fx, s.pts[i + 1] * S); return { t: 'p', pts: o }; }
      case 'q': { const cx = (s.x + s.w / 2) * S * fx, cy = (s.y + s.h / 2) * S; return { t: 'q', x: Math.round(cx - s.w / 2), y: Math.round(cy - s.h / 2), w: s.w, h: s.h }; }
    }
    return s;
  }
  function kit(src, pose, v) {
    const bones = src.bones || {}, ground = src.ground || [];
    const S = (v.elder ? ELDER_S : 1) * (v.S || 1) * (src.scale || 1);
    const k = matKit({ parts: [], ord: 0, pose, v, S, elder: !!v.elder, t: Math.max(0, Math.min(4, ((v.tier | 0) || 1) - 1)) }, v);
    const onGround = bone => { for (let b = bone; b; b = bones[b] && bones[b][2]) if (ground.includes(b)) return true; return false; };
    const xf = (x, y, bone) => {
      let a = 0;
      for (let b = bone; b && bones[b]; b = bones[b][2]) {
        const o = pose[b];
        if (o && typeof o === 'object') { if (o.rot) { [x, y] = rotP(x, y, bones[b], o.rot); a += o.rot; } x += o.dx || 0; y += o.dy || 0; }
      }
      if (!onGround(bone)) { x += pose.lean || 0; y += (pose.bob || 0) - (src.lift || 0); }
      return [(x + (pose.dx || 0)) * S, y * S, a];
    };
    const map = (s, bone) => {
      switch (s.t) {
        case 'e': { const [cx, cy, a] = xf(s.cx, s.cy, bone); return E(cx, cy, s.rx * S, s.ry * S, s.a + a); }
        case 'c': { const [x1, y1] = xf(s.x1, s.y1, bone), [x2, y2] = xf(s.x2, s.y2, bone); return C(x1, y1, s.r1 * S, x2, y2, s.r2 * S); }
        case 'p': { const o = []; for (let i = 0; i < s.pts.length; i += 2) { const q = xf(s.pts[i], s.pts[i + 1], bone); o.push(q[0], q[1]); } return { t: 'p', pts: o }; }
        case 'q': { const [cx, cy] = xf(s.x + s.w / 2, s.y + s.h / 2, bone); return Q(Math.round(cx - s.w / 2), Math.round(cy - s.h / 2), s.w, s.h); }
      }
      return s;
    };
    k.add = (z, bone, mat, s, o = {}) => { const p = { z, ord: k.ord++, bone, m: mat, s: map(s, bone), o }; k.parts.push(p); return p; };
    return k;
  }
  // Elder crown: a gold band with three points and a red gem, base centre (cx, by), width w.
  function crown(k, z, bone, cx, by, w, o = {}) {
    const h = o.h || 4.6, g = o.mat || k.gold;
    const c = k.add(z, bone, g, P(cx - w / 2, by, cx + w / 2, by, cx + w / 2 + .5, by - h, cx + w * .22, by - h * .5, cx, by - h * 1.25, cx - w * .22, by - h * .5, cx - w / 2 - .5, by - h), { sep: 1, bev: .7 });
    k.add(z + .01, bone, o.gem || k.gem, Q(Math.round(cx - .5), Math.round(by - h * .55), 1, 1), { nl: 1, lr: 6 });
    return c;
  }

  function boxOf(parts) {
    const b = [1e9, 1e9, -1e9, -1e9];
    for (const p of parts) { const q = shapeBox(p.s); b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[2]); b[3] = Math.max(b[3], q[3]); }
    return [Math.floor(b[0]), Math.floor(b[1]), Math.ceil(b[2]), Math.ceil(b[3])];
  }
  const FRAMES = ['idle0', 'idle1', 'wind', 'strike'];
  function unionBox(rig, v) { let all = []; for (const f of FRAMES) all = all.concat(rig.parts(f, v)); return boxOf(all); }
  function poseOf(src, f) { return Object.assign({}, src.poses[f] || src.poses.idle0); }
  function creature(src, elder) {
    const rig = { name: src.name, anim: src.anim, hover: !!src.hover, b1: 1, src };
    rig.parts = (f, v) => { v = v || {}; const pose = poseOf(src, f), k = kit(src, pose, v); src.draw(k, pose); return k.parts; };
    rig.box = unionBox(rig, {});
    if (elder) rig.elderBox = unionBox(rig, { elder: true });
    return rig;
  }
  // Humanoid: the character kit (facing right), then mirrored and scaled.
  function humanoid(src) {
    const rig = { name: src.name, anim: src.anim, hover: !!src.hover, b1: 1, src };
    rig.parts = (f, v) => {
      v = v || {};
      const pose = Object.assign({}, f === 'idle1' ? { bob: 1 } : f === 'wind' || f === 'strike' ? ANIMS[src.anim][f] : {});
      const k = matKit(makeKit(src.def, pose), v);
      k.elder = !!v.elder; k.S = (v.elder ? ELDER_S : 1) * (v.S || 1);
      src.draw(k, pose);
      for (const p of k.parts) p.s = flipScale(p.s, k.S, true);
      return k.parts;
    };
    rig.box = unionBox(rig, {}); rig.elderBox = unionBox(rig, { elder: true });
    return rig;
  }

  // ================= Moss Slime: a glossy green ooze with a sprout =================
  const slime = {
    name: 'Moss Slime', anim: 'lunge', scale: 1.25,
    bones: { body: [0, 0, null] },
    poses: { idle0: { sq: 0 }, idle1: { sq: .09 }, wind: { sq: .2, lean: 2 }, strike: { sq: -.14, lean: -3 } },
    draw(k, po) {
      const sq = po.sq || 0, w = 13 * (1 + sq * .7), h = 9.6 * (1 - sq), top = -2 * h + .6;
      const ooze = k.c('#5CBE62', 'slime'), core = k.c('#2F8A52', 'slime'), moss = k.c('#3F6A2A', 'hair'), leaf = k.c('#A8D45A', 'cloth'), stem = k.c('#4E7A2E', 'wood');
      // sprout behind the moss cap (a crown for the elder)
      if (!k.elder) {
        k.add(2.5, 'body', stem, C(1, top + 1.5, .7, 2, top - 3.4, .6));
        k.add(2.6, 'body', leaf, E(-.6, top - 3.6, 2.6, 1.2, .5));
        k.add(2.6, 'body', leaf, E(4.4, top - 3.8, 2.4, 1.1, -.55));
      }
      k.add(2.9, 'body', ooze, E(0, -1.8, w + 1.6, 2.4), { g: 'ooze' });
      const dome = k.add(3, 'body', ooze, E(0, -h + .4, w, h), { g: 'ooze' });
      k.add(3.1, 'body', core, E(1.5, -h * .72, w * .5, h * .46), { clip: dome, nl: 1 });
      k.add(3.2, 'body', moss, E(2, top + 1.2, w * .72, 3.4), { clip: dome });
      // a skull floats in the elder's ooze
      if (k.elder) {
        const bn = k.f('#DCD2BC', 'cloth');
        k.add(3.15, 'body', bn, E(4, -h * .7, 2.8, 2.5), { clip: dome, nl: 1 });
        k.add(3.16, 'body', k.ink, Q(2, Math.round(-h * .72), 1, 1), { nl: 1 }); k.add(3.16, 'body', k.ink, Q(4, Math.round(-h * .72), 1, 1), { nl: 1 });
      }
      // motes of light in the core, a wet sheen, lit eyes and a mouth
      k.eye(3.3, 'body', 3, Math.round(-h * .45), 1, 1, k.glow('#E8FFB0'), 4);
      k.eye(3.3, 'body', 7, Math.round(-h * .9), 1, 1, k.glow('#E8FFB0'), 4);
      k.add(3.4, 'body', k.f('#F2FFE8', 'flat'), Q(Math.round(-w * .6), Math.round(-h * 1.25), 2, 1), { nl: 1 });
      k.add(3.4, 'body', k.f('#F2FFE8', 'flat'), Q(Math.round(-w * .72), Math.round(-h * 1.0), 1, 1), { nl: 1 });
      const ey = Math.round(-h * 1.02);
      k.add(4, 'body', k.ink, Q(-8, ey, 1, 2), { nl: 1 }); k.add(4, 'body', k.ink, Q(-4, ey, 1, 2), { nl: 1 });
      k.add(4, 'body', k.ink, Q(-7, ey + 3, 3, 1), { nl: 1 });
      if (k.elder) crown(k, 4.2, 'body', 1, top + 1.4, 9);
    }
  };

  // ================= Cave Bat: violet fur, rose wings, red eyes (hovers) =================
  const wing = (k, z, bone, x0, dir, mem, bone2, o = {}) => {
    const s = dir, y0 = -24;
    const pts = [x0, y0, x0 + 6 * s, -31, x0 + 15 * s, -34.5, x0 + 13 * s, -28, x0 + 10.5 * s, -29.6, x0 + 8.4 * s, -24.6, x0 + 5.6 * s, -26.4, x0 + 1.5 * s, -20];
    k.add(z, bone, mem, P(pts), { bev: .7, tone: o.tone || 0 });
    k.add(z + .01, bone, bone2, C(x0, y0, 1.1, x0 + 6 * s, -31, .9), { tone: o.tone || 0 });
    k.add(z + .02, bone, bone2, C(x0 + 6 * s, -31, .9, x0 + 15 * s, -34.5, .55), { tone: o.tone || 0 });
    k.add(z + .03, bone, k.c('#E8DCC8'), Q(Math.round(x0 + 15.5 * s - .5), -36, 1, 1), { nl: 1 });
  };
  const bat = {
    name: 'Cave Bat', anim: 'lunge', hover: 1, scale: 1.2,
    bones: { body: [0, -22, null], head: [-1, -26, 'body'], wingF: [1, -24, 'body'], wingB: [2, -24, 'body'] },
    poses: {
      idle0: {}, idle1: { bob: 1.2, wingF: { rot: -.55 }, wingB: { rot: .5 } },
      wind: { lean: 3, bob: -2, wingF: { rot: .25 }, wingB: { rot: -.25 }, head: { rot: .15 } },
      strike: { lean: -4, bob: 2, wingF: { rot: -.7 }, wingB: { rot: .6 }, head: { rot: -.2 } }
    },
    draw(k) {
      const fur = k.c('#4E3C78', 'hair'), furL = k.c('#8A6CC0', 'cloth'), mem = k.c('#9A4E86', 'leather'), pink = k.c('#E09AAE', 'skin'), claw = k.c('#E8DCC8');
      wing(k, .5, 'wingB', 3, 1, mem, fur, { tone: 1 });
      k.add(1, 'body', claw, Q(-1, -16, 1, 2), { nl: 1 }); k.add(1, 'body', claw, Q(1, -16, 1, 2), { nl: 1 });
      const body = k.add(3, 'body', fur, E(.5, -21.5, 5, 6));
      k.add(3.1, 'body', furL, E(-1.6, -20.5, 2.8, 4.2), { clip: body });
      wing(k, 3.5, 'wingF', 0, -1, mem, fur);
      // head: ears, snout, lit eyes, fangs
      k.add(3.8, 'head', fur, P(-5.5, -29.5, -6.8, -36, -2.4, -31));
      k.add(3.8, 'head', fur, P(-.6, -31, 1, -36.6, 2.2, -29.8));
      k.add(3.85, 'head', pink, P(-5.3, -31, -6.1, -34.4, -3.6, -31.4), { nl: 1 });
      const hd = k.add(4, 'head', fur, E(-2, -28, 4.3, 3.8));
      k.add(4.1, 'head', furL, E(-5.2, -26.6, 2, 1.6), { clip: hd });
      k.eye(4.2, 'head', -5, -29, 1, 1, k.glow('#FF4A4A'), 6); k.eye(4.2, 'head', -2, -29, 1, 1, k.glow('#FF4A4A'), 6);
      k.add(4.2, 'head', k.f('#F4F0E8', 'flat'), Q(-6, -26, 1, 1), { nl: 1 }); k.add(4.2, 'head', k.f('#F4F0E8', 'flat'), Q(-4, -26, 1, 1), { nl: 1 });
      if (k.elder) {
        const horn = k.c('#D8CFB8', 'cloth');
        k.add(3.7, 'head', horn, P(-3.4, -31, -7, -34, -10.5, -33, -7.4, -35.6, -2, -32.4));
        k.add(3.7, 'head', horn, P(.2, -31.2, 3.2, -35, 7, -35.6, 3.6, -36.6, -1, -32));
        crown(k, 4.3, 'head', -2, -31, 6.4, { h: 3.8 });
        k.add(4.3, 'head', k.gold, Q(1, -27, 1, 2), { nl: 1 });
      }
    }
  };

  // ================= Rattlebones: a skeleton archer in a rusty pot helm (character kit) =================
  const bones = {
    name: 'Rattlebones', anim: 'shoot',
    def: { hs: 1.02, ws: .82, hd: 1.04, armW: .62, handS: .8, aF: -.15, aB: -.85 },
    draw(k, po) {
      const bn = k.c('#DCD4C0', 'cloth'), bnD = k.c('#A89C88', 'cloth'), gap = k.f('#2A2230', 'flat'), iron = k.c('#7E8494', 'metal'), ironD = k.c('#5A6070', 'metal'), rust = k.c('#9A5230', 'leather'), cloth = k.c('#7A3A4A', 'cloth'), lea = k.c('#5A3C2A', 'leather'), wood = k.c('#6E4A30', 'wood'), soul = k.glow('#8FE8FF');
      const u = k.u;
      if (k.elder) k.add(.2, 'up', cloth, P(-k.sw * .8, k.shY + .5, k.sw * .5, k.shY, k.sw * .2, k.hiY, -k.sw * .2, -3, -k.sw * 1.1, -5, -k.sw * 1.6, -2, -k.sw * 2, k.waY), { bev: .8, tone: 1 });
      // quiver on the back
      const qx = -k.sw * .55, qy = k.shY + 1;
      k.add(.5, 'up', lea, P(qx - 2, qy - 1, qx + .2, qy - 2.2, qx + 3.2, qy + 9, qx + 1.2, qy + 10), { bev: .8 });
      k.add(.45, 'up', k.c('#C8B8A0'), P(qx - 3, qy - 3.6, qx - 1.4, qy - 4.8, qx - .2, qy - 1.6, qx - 1.6, qy - 1));
      arm(k, 'B', bnD, bnD, {});
      // legs: thin bones with knees, iron sabatons
      for (const sd of ['B', 'F']) {
        const x = sd === 'F' ? k.fx : k.bx, z = sd === 'B' ? 1.8 : 2, mat = sd === 'B' ? bnD : bn;
        k.add(z, 'legs', mat, C(x, k.hiY, .95, x + (sd === 'F' ? .3 : -.3), -k.bootH * .8, .85), { g: 'leg' + sd });
        k.add(z + .01, 'legs', mat, E(x + .2, k.hiY * .5, 1.25, 1.1), { g: 'leg' + sd });
      }
      legs(k, null, ironD, {});
      // pelvis, spine, ribs
      k.add(2.6, 'up', bn, E(0, k.hiY + .3, k.hipW * .95, 1.7));
      k.add(2.7, 'up', bnD, C(0, k.waY - 1, .9, 0, k.hiY, .9));
      const ribs = k.add(3, 'up', bn, torsoShape(k, { bot: k.waY - .6, ww: .78 }), { bev: 1.1 });
      k.add(3.05, 'up', gap, R(-k.sw, k.shY + 2.6, k.sw * 2, .9), { clip: ribs, nl: 1 });
      k.add(3.05, 'up', gap, R(-k.sw, k.shY + 4.9, k.sw * 2, .9), { clip: ribs, nl: 1 });
      k.add(3.05, 'up', gap, R(-.4, k.shY + 1, .9, 6), { clip: ribs, nl: 1 });
      if (k.elder) k.eye(3.1, 'up', 0, Math.round(k.shY + 3), 1, 2, soul, 7);
      // tattered loincloth on a belt
      k.add(3.2, 'up', cloth, P(-k.hipW, k.waY + .4, k.hipW, k.waY + .4, k.hipW * .95, k.hiY + 3.6, k.hipW * .35, k.hiY + 2.2, 0, k.hiY + 4.6, -k.hipW * .5, k.hiY + 2.4, -k.hipW * 1.05, k.hiY + 4));
      belt(k, lea, { buckle: iron, w: 1.6 });
      // skull: sockets with a soul light, nose, teeth
      head(k, bn, { noNeck: true });
      k.add(3.9, 'up', bnD, C(k.hx - .3, k.chin - 1, .9, k.hx - .3, k.shY + .5, .9));
      const ey = Math.round(k.hy - k.hh * .05), e1 = Math.round(k.hx + k.hw * .44), e0 = Math.round(k.hx - k.hw * .2);
      k.add(4.5, 'head', gap, Q(e1 - 1, ey, 2, 2), { nl: 1 }); k.add(4.5, 'head', gap, Q(e0 - 1, ey, 2, 2), { nl: 1 });
      k.eye(4.6, 'head', e1, ey, 1, 1, soul, 6); k.eye(4.6, 'head', e0, ey, 1, 1, soul, 5);
      k.add(4.5, 'head', gap, Q(e1 + 1, ey + 2, 1, 1), { nl: 1 });
      k.add(4.5, 'head', gap, Q(e0, ey + 4, 4, 1), { nl: 1 });
      // rusty pot helm (an iron crown for the elder)
      const hx = k.hx, hy = k.hy, hw = k.hw, hh = k.hh;
      const helm = k.add(4.6, 'head', iron, P(arcPts(hx - .2, hy - hh * .25, hw * 1.08, hh * .98, Math.PI, Math.PI * 2, 10)), { sep: 1 });
      k.add(4.65, 'head', rust, E(hx + hw * .5, hy - hh * .8, 1.6, 1.2), { clip: helm, nl: 1 });
      k.add(4.7, 'head', ironD, R(hx - hw * 1.35, hy - hh * .32, hw * 2.7, 1.3), { sep: 1 });
      if (k.elder) crown(k, 4.8, 'head', hx - .2, hy - hh * 1.05, 8, { h: 4 });
      // iron pauldron, front arm, the bow
      k.add(6.8, 'armF', iron, E(k.pF[0] - .2, k.pF[1] - .5, 2.6, 2.1), { sep: 1 });
      arm(k, 'F', bn, bn, {});
      const bh = k.H * .44, dr = !!po.drawn, pull = dr ? 5 : 0;
      const items = [
        [wood, P(-.8, -1, .7, -1, 3, -bh * .45, 2.6, -bh * .95, .6, -bh - .4, 1.3, -bh * .45, -.8, -1.6)],
        [wood, P(-.8, 1, .7, 1, 3, bh * .45, 2.6, bh * .95, .6, bh + .4, 1.3, bh * .45, -.8, 1.6)],
        [lea, R(-.9, -1.6, 1.8, 3.2)]
      ];
      const str = k.f('#E8DEC8', 'flat');
      if (!dr) items.push([str, R(1, -bh + .3, .6, bh * 2 - .6), { nl: 1 }]);
      else items.push([str, P(1, -bh + .3, 1.6, -bh + .3, -pull + .6, .3, -pull, .3), { nl: 1 }], [str, P(-pull, -.3, -pull + .6, -.3, 1.6, bh - .3, 1, bh - .3), { nl: 1 }],
        [wood, R(-pull, -.5, pull + 7, 1)], [soul, P(6.6, -1.2, 8.6, 0, 6.6, 1.2), { nl: 1, lr: 6 }]);
      k.held(5.5, 'B', 0, items);
    }
  };

  // ================= Barrow Beetle: a glossy carapace with glowing runes =================
  const beetle = {
    name: 'Barrow Beetle', anim: 'lunge', scale: 1.15,
    bones: { legs: [0, 0, null], body: [2, -10, null], head: [-11, -9, 'body'], mand: [-15, -8, 'head'] },
    ground: ['legs'],
    poses: {
      idle0: {}, idle1: { bob: .8, head: { rot: -.04 } },
      wind: { lean: 3, bob: -1, head: { rot: .22 }, mand: { rot: .25 } },
      strike: { lean: -4, head: { rot: -.18 }, mand: { rot: -.3 } }
    },
    draw(k) {
      const shell = k.c('#3A8AA6', 'gem'), shellD = k.c('#1E4A60', 'flat'), chit = k.c('#2A5A70', 'leather'), chitD = k.c('#1C3848', 'leather'), mand = k.c('#D2C094', 'cloth'), rune = k.glow('#9BE8F4');
      // legs splay: front ones reach forward, back ones trail
      const leg = (z, x, s, tone) => {
        const mat = tone ? chitD : chit, kx = x + s * 4, fx = x + s * 6.4;
        k.add(z, 'legs', mat, C(x, -5.6, 1.2, kx, -9.2, 1), { tone });
        k.add(z + .01, 'legs', mat, C(kx, -9.2, 1, fx, -.5, .7), { tone });
      };
      for (const [x, s] of [[16, 1], [8, .2], [1, -1]]) leg(1, x + 2.5, s, 1);
      k.add(2.8, 'body', chitD, E(1, -6.4, 13.5, 3.6));
      // pronotum and head
      k.add(3.6, 'body', chit, E(-8.5, -10.5, 5, 5.4));
      k.add(3.8, 'head', chitD, E(-12.5, -8.4, 4.4, 3.9));
      k.eye(3.9, 'head', -15, -10, 2, 1, k.glow('#D0FCFF'), 6);
      k.add(3.7, 'mand', mand, P(-15, -8.4, -20.5, -10.6, -23.4, -8, -20.6, -8.6, -15.4, -6.6));
      k.add(3.7, 'mand', mand, P(-15.4, -6.4, -20.2, -4.4, -22.6, -1.8, -19.6, -3.2, -14.6, -5.4), { tone: 1 });
      // carapace with a seam and runes
      const sh = k.add(3.5, 'body', shell, E(3.5, -11, 14, 8.6));
      k.add(3.55, 'body', shellD, P(-6, -18.6, -4.4, -19.2, 8, -13, 17.6, -7.4, 17.2, -6.4, 7.4, -11.8), { clip: sh, nl: 1 });
      k.eye(3.6, 'body', 5, -16, 1, 2, rune, 5); k.eye(3.6, 'body', 9, -15, 2, 1, rune, 5); k.eye(3.6, 'body', 12, -11, 1, 2, rune, 5);
      if (k.elder) {
        for (const [x, y] of [[4, -19], [10, -18], [15, -14]]) k.add(3.45, 'body', chitD, P(x - 2, y + 2, x + .5, y - 3.5, x + 2, y + 2.4));
        k.add(3.9, 'head', mand, P(-13.4, -11.6, -18, -18, -21.6, -25, -17.4, -19.6, -11, -11.8), { sep: 1 });
        crown(k, 3.7, 'body', -8.5, -15, 7, { h: 3.6 });
        k.eye(3.6, 'body', 1, -12, 1, 1, rune, 4);
      }
      for (const [x, s] of [[13, 1], [5, .2], [-3, -1]]) leg(6, x, s, 0);
    }
  };

  // ================= Spore Cap: a mushroom caster with a root staff =================
  const spore = {
    name: 'Spore Cap', anim: 'cast', scale: 1.1,
    bones: { legs: [0, 0, null], body: [0, -8, null], cap: [0, -19, 'body'], armF: [-5, -15, 'body'], armB: [4.5, -15, 'body'] },
    ground: ['legs'],
    poses: {
      idle0: {}, idle1: { bob: .6, cap: { dy: .5 } },
      wind: { armF: { rot: .45 }, cap: { rot: .06 }, lean: 1 },
      strike: { armF: { rot: -.55 }, cap: { rot: -.08 }, lean: -2 }
    },
    draw(k) {
      const stem = k.c('#EAD9BA', 'cloth'), stemD = k.c('#B89E7C', 'cloth'), gill = k.c('#B8866A', 'leather'), cap = k.c('#D0463E', 'cloth'), spot = k.c('#F6EAD2', 'cloth'), wood = k.c('#6A4A30', 'wood'), orb = k.glow('#FF8ED0');
      k.add(1, 'armB', stemD, C(4.5, -15, 1.4, 8, -10.4, 1.3));
      k.add(2, 'legs', stemD, E(3.2, -1.6, 3.1, 2));
      k.add(2.1, 'legs', stem, E(-3.4, -1.6, 3.3, 2.1));
      const body = k.add(3, 'body', stem, E(0, -10.4, 6.6, 8.6));
      k.add(3.1, 'body', stemD, E(3.6, -9, 2.4, 6.4), { clip: body, nl: 1 });
      k.add(3.2, 'body', k.ink, Q(-5, -15, 1, 2), { nl: 1 }); k.add(3.2, 'body', k.ink, Q(-2, -15, 1, 2), { nl: 1 });
      k.add(3.2, 'body', k.ink, Q(-4, -11, 2, 1), { nl: 1 });
      if (k.elder) k.add(3.3, 'body', k.gold, R(-6.6, -8.4, 13.2, 1.4), { clip: body });
      // the cap: gills, dome, spots, glowing pods on the rim
      k.add(3.8, 'cap', gill, E(0, -18.4, 12, 2.2));
      const dome = k.add(4, 'cap', cap, P(arcPts(0, -18.6, 13.6, 11, Math.PI, Math.PI * 2, 16), 13.2, -17.6, -13.2, -17.6), { bev: 1.8 });
      for (const [x, y, rx, ry] of [[-6.5, -24.6, 2.4, 1.8], [2.4, -27, 2, 1.5], [8.4, -22, 2.1, 1.6], [-11, -20.4, 1.4, 1.1], [-.4, -21.4, 1.4, 1]]) k.add(4.1, 'cap', spot, E(x, y, rx, ry), { clip: dome });
      k.eye(4.2, 'cap', -13, -18, 1, 1, orb, 4); k.eye(4.2, 'cap', 12, -18, 1, 1, orb, 4);
      if (k.elder) {
        for (const [x, s] of [[-7, .8], [5, 1]]) {
          k.add(3.95, 'cap', stem, R(x - .7, -30 * 1 - s * 1.5 + 2, 1.4, 4));
          k.add(3.96, 'cap', cap, P(arcPts(x, -29 - s * 1.5 + 2, 3 * s, 2.6 * s, Math.PI, Math.PI * 2, 8)), { bev: .8 });
        }
        crown(k, 4.3, 'cap', 0, -28.6, 7, { h: 3.8 });
      }
      // front arm and the root staff with its orb
      k.add(6, 'armF', stem, C(-5, -15, 1.5, -8.4, -10.6, 1.4));
      k.add(5.8, 'armF', wood, P(-8.4, -.6, -9.8, -.6, -11.2, -24, -9.8, -24.4));
      k.add(5.85, 'armF', wood, P(-11.6, -23.6, -13.4, -26.6, -11.6, -29.4, -9, -28.4, -8.6, -26, -9.8, -24.4), { bev: .7 });
      k.add(5.9, 'armF', orb, E(-11, -27.2, 2.5, 2.5), { lr: 16, pulse: 1 });
      k.add(6.1, 'armF', stem, E(-9, -10.2, 1.6, 1.6), { sep: 1 });
    }
  };

  // ================= Quarry Golem: stone blocks, moss and a glowing core =================
  const golem = {
    name: 'Quarry Golem', anim: 'slam',
    bones: { legs: [0, 0, null], body: [0, -14, null], head: [-3, -35, 'body'], armF: [-10, -30, 'body'], armB: [9, -30, 'body'] },
    ground: ['legs'],
    poses: {
      idle0: {}, idle1: { bob: 1 },
      wind: { armF: { rot: 2.75 }, lean: 2, bob: -1 },
      strike: { armF: { rot: .55 }, lean: -3, bob: 1 }
    },
    draw(k) {
      const st = k.c('#94886F', 'stone'), stD = k.c('#6C6352', 'stone'), moss = k.c('#5C8A36', 'hair'), seam = k.glow('#FF9E3D'), core = k.glow('#FFD27A'), cry = k.glow('#7AF0E0');
      // back arm, legs
      k.add(1, 'armB', stD, E(9.5, -30, 5, 4.6));
      k.add(1.05, 'armB', stD, P(7, -27, 13, -27, 13.6, -17, 7.4, -17), { bev: 1.2 });
      k.add(1.1, 'armB', stD, E(10.8, -13.6, 5, 4.4));
      k.add(2, 'legs', stD, P(2, -14, 9.6, -14, 10.4, 0, 1.4, 0), { bev: 1.2 });
      k.add(2.1, 'legs', st, P(-9.4, -14, -1.6, -14, -.6, 0, -11.6, 0, -10.6, -3), { bev: 1.2 });
      k.add(2.2, 'legs', seam, P(-7, -10, -5.6, -10, -6, -5, -7.2, -5), { nl: 1, lr: 5 });
      // torso block with glowing cracks, a core and moss on the back
      k.add(2.9, 'body', stD, P(-9.6, -16.4, 9.6, -16.4, 9.6, -12.4, -9.6, -12.4), { bev: 1 });
      const tor = k.add(3, 'body', st, P(-12.6, -33.6, 1.6, -37.2, 12, -32.6, 13.2, -21, 8.6, -14, -8.6, -14, -13.4, -20.6), { bev: 1.8 });
      k.add(3.1, 'body', seam, P(-3.4, -34.6, -2, -34.6, -4.2, -28, -1, -22.4, -2.4, -22.4, -5.6, -28), { clip: tor, nl: 1, lr: 6 });
      k.add(3.1, 'body', seam, P(6, -30.6, 7.4, -30.6, 4, -23, 2.6, -23), { clip: tor, nl: 1, lr: 5 });
      k.add(3.15, 'body', core, E(-3.2, -24.6, 2, 2), { nl: 1, lr: 16, pulse: 1 });
      k.add(3.2, 'body', moss, P(-6, -35.4, 1.6, -38, 12.6, -33.6, 12, -29, 6, -32, -1, -33.6), { clip: tor });
      if (k.elder) for (const [x, y, h, w] of [[5, -35.6, 7, 2.2], [9, -33.8, 5.6, 1.8], [1.4, -36.6, 5, 1.8]]) k.add(2.95, 'body', cry, P(x - w, y + 1, x - w * .3, y - h, x + w * .4, y - h - 1, x + w, y + 1), { nolight: 1 });
      // head: a sunken block with a lit eye slit
      const hd = k.add(4, 'head', st, P(-11, -44, -1.4, -45.6, 1.8, -38.6, -.6, -33, -10.6, -33.8, -11.6, -38), { bev: 1.3, sep: 1 });
      k.add(4.1, 'head', stD, R(-11.6, -41.6, 12, 1.6), { clip: hd, nl: 1 });
      k.add(4.15, 'head', k.f('#2A2230', 'flat'), R(-10.6, -38.6, 8, 2.4), { clip: hd, nl: 1 });
      k.eye(4.2, 'head', -10, -38, 2, 1, seam, 6); k.eye(4.2, 'head', -6, -38, 2, 1, seam, 6);
      if (k.elder) for (const [x, h, w] of [[-9, 5, 1.5], [-5.6, 7.6, 1.9], [-2, 5.4, 1.5]]) k.add(4.3, 'head', cry, P(x - w, -43.6, x, -44.6 - h, x + w, -44), { lr: 8, nolight: h < 7 });
      // front arm: shoulder boulder, two blocks, a fist
      const sh = k.add(6, 'armF', st, E(-10, -30, 5.6, 5.2));
      k.add(6.05, 'armF', moss, E(-11, -34, 5, 2.6), { clip: sh });
      k.add(5.9, 'armF', st, P(-14, -27, -6.8, -27, -7.6, -19.4, -13.8, -19.4), { bev: 1.2 });
      k.add(5.95, 'armF', st, P(-15.2, -20.4, -6, -20.4, -5.4, -12.6, -16, -12.6), { bev: 1.2 });
      k.add(5.97, 'armF', seam, R(-13.6, -17, 5, 1), { nl: 1, lr: 4 });
      k.add(6.1, 'armF', st, E(-10.8, -9.8, 6, 5), { sep: 1 });
      if (k.elder) k.add(6.2, 'armF', cry, P(-15, -33, -17.6, -39, -12.6, -33.8), { lr: 8 });
    }
  };

  // ================= Marsh Wraith: a hooded spirit with a wisp lantern (hovers) =================
  const wraith = {
    name: 'Marsh Wraith', anim: 'heal', hover: 1, lift: 5,
    bones: { body: [0, -20, null], head: [-1, -29, 'body'], armF: [-4, -26, 'body'], armB: [4, -26, 'body'], tail: [3, -10, 'body'] },
    poses: {
      idle0: {}, idle1: { bob: -1, tail: { rot: .12 } },
      wind: { bob: -2, armF: { rot: 1.05 }, head: { rot: .08 } },
      strike: { lean: -2, armF: { rot: .35 }, tail: { rot: -.15 } }
    },
    draw(k) {
      const robe = k.c('#6E9E90', 'cloth'), robeD = k.c('#34504A', 'cloth'), cord = k.c('#C8BE9E', 'leather'), hand = k.c('#CFEDE2', 'cloth'), voidC = k.f('#070A0C', 'flat'), wisp = k.glow('#B6FFD8'), eye = k.glow('#E4FFF4'), chain = k.c('#8A909C', 'metal');
      k.add(.5, 'tail', robeD, P(2, -12, 9, -9.6, 15.6, -3, 10.4, -4.6, 8, -2, 4.6, -5.6));
      k.add(1, 'armB', robeD, C(4, -26, 1.7, 8.6, -21, 1.5));
      k.add(1.05, 'armB', hand, E(9.4, -20.2, 1.3, 1.3), { tone: 1 });
      const body = k.add(3, 'body', robe, P(-7, -30, 6, -30, 8.6, -19, 10, -9, 7.6, -4.6, 5, -8, 2.4, -2.4, -.6, -6.6, -3.6, -2.6, -6, -7.4, -8.8, -11.4, -8.4, -20), { bev: 1.3 });
      k.add(3.1, 'body', robeD, P(-3, -18, -2, -18, -3.6, -5.4, -4.6, -6), { clip: body, nl: 1 });
      k.add(3.1, 'body', robeD, P(2.6, -18, 3.6, -18, 5.4, -7.6, 4.4, -7.2), { clip: body, nl: 1 });
      k.add(3.2, 'body', cord, R(-8.4, -20.6, 17, 1.4), { clip: body });
      k.add(3.25, 'body', cord, R(-5.6, -19.6, 1.2, 5));
      if (k.elder) { k.add(3.3, 'body', chain, R(6, -19, .8, 11), { nl: 1 }); k.add(3.3, 'body', chain, R(-6.6, -19, .8, 8), { nl: 1 }); }
      // hood with a void and two lit eyes
      const hood = k.add(4, 'head', robe, P(-8, -28, -7.4, -34.6, -3.4, -39.6, 2.6, -38.8, 6.6, -34, 7.2, -27.4), { bev: 1.3, sep: 1 });
      k.add(4.05, 'head', robeD, P(2.6, -38.8, 6, -41, 9, -40.4, 6.6, -34), { tone: 0 });
      k.add(4.1, 'head', voidC, E(-4.2, -32.2, 3.6, 3.8), { clip: hood });
      k.eye(4.2, 'head', -6, -33, 1, 1, eye, 6); k.eye(4.2, 'head', -3, -33, 1, 1, eye, 6);
      if (k.elder) {
        const ant = k.c('#D8CFB8', 'cloth');
        k.add(3.9, 'head', ant, P(-5, -38, -8, -43, -11.6, -45, -9, -42.2, -6.6, -37.4));
        k.add(3.9, 'head', ant, P(-8.6, -42.6, -11.8, -41.6, -12, -40.4, -8.4, -41.2));
        k.add(3.9, 'head', ant, P(1, -39, 3, -45, 6, -48, 4.2, -44, 2.8, -38.6));
        crown(k, 4.3, 'head', -1, -38.4, 7, { h: 3.4 });
      }
      // front arm with the chained wisp
      k.add(6, 'armF', robe, C(-4, -26, 1.9, -8.6, -21.4, 1.7));
      k.add(6.1, 'armF', hand, E(-9.4, -20.4, 1.4, 1.4), { sep: 1 });
      k.add(5.9, 'armF', chain, R(-10, -19.4, .8, 3.4), { nl: 1 });
      k.add(5.95, 'armF', wisp, E(-9.6, -14.4, 2.2, 2.5), { lr: 16, pulse: 1 });
    }
  };

  for (const [key, src] of Object.entries({ slime, bat, beetle, spore, golem, wraith })) ENEMY_RIGS[key] = creature(src, true);
  ENEMY_RIGS.bones = humanoid(bones);

  // ================= World boss: the wyrm (palette per raid generation) =================
  const WYRM_GENS = [
    // The Ashen Wyrm
    { scale: '#8A3345', scaleD: '#4A1A2A', belly: '#D8A070', wing: '#5A2230', wingM: '#A0444E', horn: '#EFE6D6', eye: '#FFD27A', maw: '#FF6B3D' },
    // The Hollow King
    { scale: '#5A4A7A', scaleD: '#2E2444', belly: '#C8BCA8', wing: '#3A2E54', wingM: '#7A6AA0', horn: '#E6DCC4', eye: '#B58CFF', maw: '#D8B8FF' },
    // The Mire Colossus
    { scale: '#4E6A3A', scaleD: '#2A3A24', belly: '#A89868', wing: '#34462A', wingM: '#6E8A4A', horn: '#C8B890', eye: '#D8F07A', maw: '#B6F09A' },
    // The Glass Hydra
    { scale: '#3F8FA8', scaleD: '#1F4A5E', belly: '#BCE8F0', wing: '#2A5A70', wingM: '#6AB8D0', horn: '#E0F4FF', eye: '#9FE8FF', maw: '#C8FAFF' },
    // The Lantern Eater
    { scale: '#3A3040', scaleD: '#1E1824', belly: '#8A6A4A', wing: '#2A2230', wingM: '#5A4A5E', horn: '#D8C8A8', eye: '#FF9E3D', maw: '#FFB347' },
    // The Pale Tyrant
    { scale: '#C8C4D4', scaleD: '#7E7890', belly: '#EFE6D6', wing: '#8E88A0', wingM: '#D8D4E4', horn: '#F2C14E', eye: '#E0524F', maw: '#FF8A6A' }
  ];
  const wyrm = {
    name: 'Wyrm', anim: 'breath',
    bones: { legs: [0, 0, null], body: [6, -21, null], neck: [-6, -27, 'body'], head: [-17, -44, 'neck'], jaw: [-15, -40, 'head'], wingF: [4, -30, 'body'], wingB: [8, -32, 'body'], tail: [18, -22, 'body'] },
    ground: ['legs'],
    poses: {
      idle0: {}, idle1: { bob: 1, wingF: { rot: -.05 }, wingB: { rot: .05 }, tail: { rot: .03 } },
      wind: { neck: { rot: .22 }, head: { rot: .14 }, wingF: { rot: .1 }, wingB: { rot: -.08 }, lean: 2, bob: -1 },
      strike: { neck: { rot: -.12 }, head: { rot: -.16 }, jaw: { rot: -.5 }, wingF: { rot: -.08 }, wingB: { rot: .06 }, lean: -3 }
    },
    draw(k) {
      const pal = WYRM_GENS[(Math.max(1, (k.v.gen | 0) || 1) - 1) % WYRM_GENS.length];
      const sc = k.c(pal.scale, 'leather'), scD = k.c(pal.scaleD, 'leather'), bel = k.c(pal.belly, 'cloth'), wg = k.c(pal.wing, 'leather'), wgM = k.c(pal.wingM, 'leather'), horn = k.c(pal.horn, 'cloth'), eye = k.glow(pal.eye), maw = k.glow(pal.maw), fang = k.f('#F2EADA', 'flat');
      // wing: shoulder, elbow and tip, the membrane scalloped between the finger struts
      const wing = (z, bone, sh, el, tip, fingers, mem, tone) => {
        const pts = [sh[0], sh[1], el[0], el[1], tip[0], tip[1]];
        for (const f of fingers) pts.push(f[0], f[1], f[2], f[3]);
        pts.push(sh[0] + (tip[0] - sh[0]) * .3, sh[1] + 4);
        k.add(z, bone, mem, P(pts), { bev: 1, tone });
        k.add(z + .01, bone, scD, C(sh[0], sh[1], 1.9, el[0], el[1], 1.3), { tone });
        k.add(z + .02, bone, scD, C(el[0], el[1], 1.3, tip[0], tip[1], .7), { tone });
        for (const f of fingers) k.add(z + .02, bone, scD, C(el[0], el[1], 1, f[0], f[1], .6), { tone });
        k.add(z + .03, bone, horn, P(el[0] - 1, el[1], el[0], el[1] - 3.6, el[0] + 1.4, el[1] - .4));
      };
      wing(0, 'wingB', [8, -32], [-2, -58], [-14, -70], [[-12, -60, -8, -62], [-6, -52, -2, -52]], wgM, 1);
      // tail with a spade tip, far legs
      k.add(1, 'tail', sc, P(16, -29, 29, -23, 39, -13, 49, -8, 54, -9, 51, -3.4, 40, -3.4, 29, -9, 17, -15), { bev: 1.3 });
      k.add(1.05, 'tail', horn, P(50, -10, 60, -14, 57, -3.4, 50.6, -3), { bev: .7 });
      for (const [x, y] of [[26, -24], [36, -15], [45, -10]]) k.add(.9, 'tail', horn, P(x - 2.2, y + 1, x + .4, y - 3.6, x + 2.2, y + 1.4));
      k.add(1.1, 'legs', sc, P(17, -14, 25, -14, 24, -4, 27, 0, 17, 0, 18.6, -5), { bev: 1, tone: 1 });
      k.add(1.1, 'legs', sc, P(-3, -14, 3, -14, 2, -4, 3.4, 0, -5, 0, -3.4, -5), { bev: 1, tone: 1 });
      // body with belly plates and back spikes
      for (const [x, y, h] of [[0, -31, 5], [7, -32.4, 5.8], [14, -30.6, 5], [19.6, -27, 4]]) k.add(2.9, 'body', horn, P(x - 2.6, y + 2, x - .2, y - h, x + 2.4, y + 2.4));
      const body = k.add(3, 'body', sc, E(6, -21, 16, 11));
      const belly = k.add(3.1, 'body', bel, E(-3, -15.6, 10, 8.4), { clip: body });
      for (const y of [-19, -14.6]) k.add(3.15, 'body', scD, R(-14, y, 15, .9), { clip: belly, nl: 1 });
      // neck and head: horns swept back, a lit eye, the maw glows when the jaw drops
      const nk = k.add(3.4, 'neck', sc, C(-5, -26, 7, -16, -41, 5));
      k.add(3.45, 'neck', bel, C(-10, -23, 3.8, -20, -38, 2.4), { clip: nk });
      for (const [x, y] of [[-4, -34], [-10, -41]]) k.add(3.35, 'neck', horn, P(x - 1, y + 1.4, x + 3.8, y - 2.8, x + 2.4, y + 2.6));
      k.add(3.7, 'head', maw, P(-14, -43.4, -33, -43, -31.4, -39.4, -18, -39), { nl: 1, lr: 14 });
      k.add(3.8, 'jaw', sc, P(-13, -41.4, -33, -41.2, -31.4, -37.4, -19, -36), { bev: .9, tone: 1 });
      k.add(3.85, 'jaw', fang, Q(-31, -42, 1, 1), { nl: 1 }); k.add(3.85, 'jaw', fang, Q(-26, -42, 1, 1), { nl: 1 });
      k.add(3.9, 'head', horn, P(-15, -49, -9, -56, -1, -60, -7, -53, -12.6, -46.6), { bev: .8 });
      const hd = k.add(4, 'head', sc, P(-11, -47, -19, -51, -29, -49.4, -36, -45, -35, -41.6, -24, -41, -12, -40), { bev: 1.2 });
      k.add(4.1, 'head', scD, P(-19, -49.6, -29, -47.6, -28.4, -46.2, -19.4, -47.8), { clip: hd, nl: 1 });
      k.add(4.15, 'head', horn, P(-19, -50, -19, -57, -14, -63, -15.6, -56, -16, -49.4), { bev: .8 });
      k.eye(4.2, 'head', -25, -47, 2, 1, eye, 10);
      k.add(4.2, 'head', k.ink, Q(-35, -45, 1, 1), { nl: 1 });
      k.add(4.2, 'head', fang, Q(-33, -41, 1, 1), { nl: 1 }); k.add(4.2, 'head', fang, Q(-28, -41, 1, 1), { nl: 1 });
      // near wing, raised behind; near legs with claws
      wing(5.5, 'wingF', [4, -30], [18, -60], [36, -68], [[34, -56, 29, -58], [27, -46, 22, -48]], wgM, 0);
      k.add(6, 'legs', sc, P(-9, -17, -1, -17, -2, -5, 0, 0, -11, 0, -8.4, -5.4), { bev: 1.1 });
      k.add(6.05, 'legs', horn, P(-11, 0, -13.6, 0, -11.4, -2.4)); k.add(6.05, 'legs', horn, P(-6.6, 0, -9, 0, -7, -2.4));
      k.add(6.1, 'legs', sc, E(14, -13, 7, 7));
      k.add(6.2, 'legs', sc, P(10, -8, 18, -8, 17.4, 0, 8, 0), { bev: 1 });
      k.add(6.25, 'legs', horn, P(8, 0, 5.6, 0, 7.6, -2.4));
    }
  };
  ENEMY_RIGS.wyrm = creature(wyrm, false);
  ENEMY_RIGS.wyrm.gens = WYRM_GENS;

  // ================= Gather nodes: ore and wood (tier 1-5 recolours; more detail at high tiers) =================
  const TIER = {
    V: ['#C07A42', '#A8B0C0', '#86D0DE', '#B0A0EA', '#E0663A'],
    oreGlow: ['#FFC080', '#DDEEFF', '#A8F4FF', '#DCCBFF', '#FF9A5A'],
    bark: ['#8A5E3A', '#6E4432', '#5E5A4A', '#AFC4BE', '#C27A34'],
    leaf: ['#5FAE4E', '#2F7D5A', '#8C9A55', '#A9D8D0', '#FFB347'],
    leafD: ['#3E7A3A', '#1E5440', '#5E6A38', '#6E9A96', '#C87A2A'],
    leafGlow: ['#E8F5C8', '#E8F5C8', '#E8F5C8', '#E0FFF8', '#FFE08A']
  };
  const nodeOre = {
    name: 'Ore vein', anim: 'shake',
    bones: { base: [0, 0, null] },
    poses: { idle0: {}, idle1: {}, wind: { dx: 1 }, strike: { dx: -1 } },
    draw(k) {
      const t = k.t, rock = k.f('#6E6878', 'stone'), rockD = k.f('#4A4452', 'stone'), moss = k.f('#4E6A3A', 'hair'), vein = k.f(TIER.V[t], 'metal'), glint = k.f(TIER.oreGlow[t], 'glow', { light: TIER.oreGlow[t] });
      k.add(1, 'base', rockD, P(3, 0, 5, -14, 11, -20.6, 18, -17, 20, -4, 19, 0), { bev: 1.4 });
      const big = k.add(3, 'base', rock, P(-17, 0, -16, -10, -10.6, -18.4, -2, -23, 7, -20.4, 12.6, -11, 13.6, 0), { bev: 1.8 });
      k.add(3.05, 'base', rockD, P(-3, -23, -1.6, -23, -4.2, -12, -5.6, -12), { clip: big, nl: 1 });
      for (const pts of [[-12.4, -12.4, -8, -16.4, -4.6, -14.6, -7.4, -11.4, -11, -10], [1, -18.4, 4.6, -20, 6.6, -17, 3.2, -15.8], [-6, -6.6, -1.4, -8.4, 1.6, -5, -3, -4.2], [6.4, -9, 9.6, -10.2, 10.4, -6.8, 7.4, -6]]) k.add(3.1, 'base', vein, P(pts), { clip: big, bev: .7 });
      if (t >= 1) for (const [x, y] of [[-9, -15], [4, -19], [-2, -8]]) k.add(3.2, 'base', glint, Q(x, y, 1, 1), { nl: 1, nolight: t < 2, lr: 5 });
      if (t >= 2) { k.add(2.5, 'base', t >= 3 ? glint : vein, P(9, -14, 12, -25, 15, -13), { bev: .6, lr: 8 }); k.add(2.5, 'base', t >= 3 ? glint : vein, P(13, -10, 19, -19.6, 18.4, -8), { bev: .6, lr: 8 }); }
      if (t >= 4) k.add(3.3, 'base', glint, P(-15, -4, -16.6, -12, -12.8, -5), { lr: 8 });
      k.add(3.2, 'base', moss, P(-16, -1, -13, -5.4, -7, -3.4, -9, 0), { clip: big });
      k.add(6, 'base', rock, P(-22, 0, -20.4, -5.4, -15, -7, -11.4, 0), { bev: 1.2 });
      k.add(6.1, 'base', moss, P(-20, -5.6, -16.4, -7.6, -13, -5.6, -17, -5), { nl: 1 });
    }
  };
  const nodeWood = {
    name: 'Tree', anim: 'shake', scale: .8,
    bones: { base: [0, 0, null], crown: [0, -24, 'base'] },
    poses: { idle0: {}, idle1: { crown: { rot: .015 } }, wind: { crown: { rot: -.03 } }, strike: { crown: { rot: .05 }, dx: 1 } },
    draw(k) {
      const t = k.t, bark = k.f(TIER.bark[t], 'wood'), barkD = k.f(mix(TIER.bark[t], '#1A1020', .4), 'wood'), leaf = k.f(TIER.leaf[t], 'hair'), leafD = k.f(TIER.leafD[t], 'hair'), moss = k.f('#4E6A3A', 'hair'), lg = k.f(TIER.leafGlow[t], 'glow', { light: TIER.leafGlow[t] });
      k.add(0, 'crown', leafD, E(9, -35, 10, 8));
      k.add(0, 'crown', leafD, E(-9, -37, 9.6, 7.6));
      k.add(2, 'base', bark, P(-11, 0, -6, -3, -4, -8, 4, -8, 6, -3, 11, 0), { bev: .9 });
      const tr = k.add(3, 'base', bark, P(-4.4, -1, -3.6, -24, -1.6, -31, 2.8, -31, 4.4, -24, 4.6, -1), { bev: 1.2 });
      k.add(3.05, 'base', bark, P(2, -22, 8.6, -29.6, 10, -28, 4, -19.6), { bev: .8 });
      k.add(3.05, 'base', bark, P(-2, -24, -8, -30, -9, -28.6, -3.2, -21), { bev: .8 });
      k.add(3.1, 'base', barkD, P(-.8, -24, .4, -24, -.2, -5, -1.4, -5), { clip: tr, nl: 1 });
      k.add(3.1, 'base', barkD, E(2.2, -13, 1.2, 1.8), { clip: tr, nl: 1 });
      k.add(3.2, 'base', moss, P(-4.6, -1, -4, -7, -1.4, -3.6, -1.6, -1), { clip: tr });
      k.add(4, 'crown', leaf, E(0, -41, 13, 10));
      k.add(4.05, 'crown', leaf, E(-9, -33, 8.4, 5.6));
      k.add(4.05, 'crown', leaf, E(9.6, -33.4, 8, 5.6));
      k.add(4.1, 'crown', leaf, E(1.4, -50, 8.4, 6));
      k.add(4.2, 'crown', leafD, P(-7, -37, 0, -35, 7, -37.4, 1, -33.6), { nl: 1 });
      k.add(4.2, 'crown', leafD, P(-3.6, -46, 4.6, -45, 8, -47.4, 2.6, -43.4), { nl: 1 });
      if (t >= 3) for (const [x, y] of [[-6, -36], [7, -40], [0, -49], [-10, -43], [11, -33]].slice(0, t >= 4 ? 5 : 3)) k.add(4.3, 'crown', lg, Q(x, y, 1, 2), { nl: 1, lr: 6 });
    }
  };
  const tierRig = src => {
    const rig = creature(src, false), parts = rig.parts;
    rig.parts = (f, v) => parts(f, { tier: (v && v.tier) || 1 });
    return rig;
  };
  ENEMY_RIGS['node:ore'] = tierRig(nodeOre);
  ENEMY_RIGS['node:wood'] = tierRig(nodeWood);
  // Crafting nodes (11-art-craft.js) use the same creature format.
  if (typeof CRAFT_NODE_RIGS !== 'undefined') for (const key in CRAFT_NODE_RIGS) ENEMY_RIGS[key] = tierRig(CRAFT_NODE_RIGS[key]);
}
