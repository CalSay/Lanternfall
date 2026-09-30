// 13b-art-critters: the small critters that follow the hero (docs/design/achievements.md 4.3, task AC4).
// DATA and pure maths only: no DOM (loads in Node). Drawn in B1 with kit shapes (12a) and baked by
// 60b's rasterize (3 tones, section lines, ink outline) in 64-looks.js, at 2 CSS px per art px.
//
// Lore (lore.md 9.5): each one is an ordinary animal or a thing the dark has left, so each is on the
// lamp's side. None is ever a combat target or counted in the camp's character budget.
//
// CRITTER_ART[id] = { n, fly, parts(frame) -> [{ z, ord, m, s, o }] }
//   Frames: idle0, idle1 (sitting, a breath or a wag), hop0, hop1 (moving: a crouch and a hop, or a
//   trot), sleep. Facing right, feet at (0, 0), 8-12 art px tall. fly: hovers (the Lampmoth circles
//   the hero's lantern, the Gold Wisp floats by the shoulder); its feet are the hover point.
const CRITTER_ART = (() => {
  const { m, E, P, C, R, Q } = AK;
  const FRAMES = ['idle0', 'idle1', 'hop0', 'hop1', 'sleep'];
  function kit() {
    const k = { parts: [], ord: 0 };
    k.add = (z, mat, s, o) => { const p = { z, ord: k.ord++, m: mat, s, o: o || {} }; k.parts.push(p); return p; };
    return k;
  }
  const eyeM = m('#1A1420', 'flat');
  const eyes = (k, pts, sleep) => { for (const [x, y] of pts) k.add(9, eyeM, sleep ? Q(x, y + 1, 1, 1) : Q(x, y, 1, 2), { nl: 1 }); };

  const DEFS = {
    // A small moss slime, round, with one leaf. "Beaten, it is only moss again."
    cr_moss: { n: 'Mossling', parts(f) {
      const k = kit(), moss = m('#6EA048', 'slime'), dk = m('#3E6A2E', 'flat');
      const sq = { idle0: 0, idle1: 1, hop0: 2, hop1: -1, sleep: 1.5 }[f] || 0, dy = f === 'hop1' ? -3 : 0;
      const rx = 4.4 * (1 + sq * .08), ry = 3.5 * (1 - sq * .1), cy = -ry + dy;
      k.add(1, moss, E(0, cy, rx, ry), { bev: 1 });
      for (const [x, y] of [[-3, 1], [-1, -1], [-2, 2]]) k.add(2, dk, Q(x, Math.round(cy + y), 1, 1), { nl: 1 });
      eyes(k, [[1, Math.round(cy - .8)], [3, Math.round(cy - .8)]], f === 'sleep');
      const top = cy - ry;
      k.add(3, m('#4A7A30', 'flat'), Q(0, Math.round(top - 1), 1, 1.5), { nl: 1 });
      k.add(3, m('#9ED060'), P(.2, top - .6, 3, top - 2.6, 2, top - 3.4, -.4, top - 1.6), { sep: 1 });
      return k.parts;
    } },
    // A pale moth that circles the lantern, never touching it.
    cr_moth: { n: 'Lampmoth', fly: 1, parts(f) {
      const k = kit(), wing = m('#ECE4CC'), wingB = m('#CFC4A6'), body = m('#8A7658', 'leather'), spot = m('#B89C6A', 'flat');
      const up = f !== 'idle1' && f !== 'hop1';
      // back wing, body, front wing: two rounded wings over a small furry body
      if (up) k.add(1, wingB, E(-1.6, -6.6, 2.2, 2.8, -.5), { bev: .6 });
      else k.add(1, wingB, E(-2, -2.4, 2.6, 1.8, .4), { bev: .6 });
      k.add(2, body, E(0, -3.6, 2.4, 1.3), { bev: .8 });
      k.add(2.1, m('#D8CCB0'), E(2.2, -4, 1.2, 1.1), { sep: 1 });
      if (up) k.add(3, wing, E(.2, -7, 2.4, 3, .35), { bev: .6, sep: 1 });
      else k.add(3, wing, E(-.4, -2, 2.8, 1.9, -.3), { bev: .6, sep: 1 });
      k.add(4, spot, up ? Q(0, -8, 1, 1) : Q(-1, -2, 1, 1), { nl: 1 });
      k.add(4, m('#6A5A40', 'flat'), Q(3, -6, 1, 1), { nl: 1 }); k.add(4, m('#6A5A40', 'flat'), Q(4, -7, 1, 1), { nl: 1 });
      eyes(k, [[3, -5]], f === 'sleep');
      return k.parts;
    } },
    // A ginger cat.
    cr_cat: { n: 'Hearth Cat', parts(f) {
      const k = kit(), gin = m('#D8883A'), str = m('#A85A26', 'flat'), cream = m('#F2E2C4');
      if (f === 'sleep') {   // a loaf, tail round the paws
        k.add(1, gin, E(0, -2.8, 4.4, 2.8), { bev: 1 });
        k.add(2, gin, E(3.2, -3, 2.2, 2), { sep: 1 });
        k.add(2.1, gin, P(2, -4.4, 2.4, -6.4, 3.4, -4.8), { sep: 1 }); k.add(2.1, gin, P(3.6, -4.8, 4.8, -6.4, 5, -4.2), { sep: 1 });
        k.add(3, gin, C(-4, -.8, 1, 3, -.6, .9), { sep: 1 });
        for (const x of [-3, -1, 1]) k.add(2.5, str, Q(x, -5, 1, 1), { nl: 1 });
        eyes(k, [[3, -4], [5, -4]], true);
        return k.parts;
      }
      if (f === 'hop0' || f === 'hop1') {   // walking
        const dy = f === 'hop1' ? -1 : 0, lx = f === 'hop0' ? [-3.8, -1.6, 1.6, 3.8] : [-2.6, -2, 2, 2.6];
        k.add(1, gin, C(-3.6, -4.4 + dy, .9, -5.8, -9 + dy, .8), { sep: 1 });
        lx.forEach((x, i) => k.add(i % 3 ? 2.2 : 1.8, gin, C(x * .8, -3 + dy, .8, x, 0, .7), { sep: 1 }));
        k.add(2, gin, E(-.3, -4.4 + dy, 4, 2.1), { bev: 1 });
        for (const x of [-2, 0]) k.add(2.3, str, Q(x, Math.round(-6 + dy), 1, 2), { nl: 1 });
        const hy = -6.6 + dy;
        k.add(3, gin, P(2.4, hy - 1.4, 2.8, hy - 3.6, 3.8, hy - 1.8), { sep: 1 }); k.add(3, gin, P(4, hy - 1.8, 5.2, hy - 3.6, 5.4, hy - 1.2), { sep: 1 });
        k.add(3.1, gin, E(4, hy, 2.3, 2), { sep: 1 });
        k.add(3.2, cream, E(5.4, hy + .9, 1.1, .8), { nl: 1 });
        eyes(k, [[4, Math.round(hy - 1)], [6, Math.round(hy - 1)]], false);
        return k.parts;
      }
      // sitting
      const t = f === 'idle1' ? 1 : 0;
      k.add(1, gin, C(-3, -1, 1, -5.4, -4.4, .9), { sep: 1 });
      k.add(1.1, gin, C(-5.4, -4.4, .9, -5 + t, -7 + t * .4, .8), { sep: 1 });
      k.add(2, gin, E(-1.2, -2.4, 3, 2.4), { bev: 1 });
      const body = k.add(2.1, gin, E(.2, -4.2, 2.6, 3.4), { bev: 1, sep: 1 });
      k.add(2.15, cream, E(1.6, -3.6, 1.2, 2.4), { clip: body });
      for (const [x, y] of [[-1, -6], [-2, -4], [-1, -2]]) k.add(2.3, str, Q(x, y, 2, 1), { nl: 1 });
      k.add(2.4, gin, C(1.8, -3.5, .8, 2.2, 0, .8), { sep: 1 });
      const hy = -8.6;
      k.add(3, gin, P(0, hy - 1.2, .3, hy - 3.6, 1.6, hy - 1.8), { sep: 1 }); k.add(3, gin, P(2, hy - 1.8, 3.4, hy - 3.8, 3.8, hy - 1.2), { sep: 1 });
      k.add(3.1, gin, E(1.8, hy, 2.6, 2.2), { sep: 1 });
      k.add(3.15, str, Q(1, Math.round(hy - 2), 2, 1), { nl: 1 });
      k.add(3.2, cream, E(3.2, hy + 1, 1.2, .8), { nl: 1 });
      eyes(k, [[2, Math.round(hy - 1)], [4, Math.round(hy - 1)]], false);
      return k.parts;
    } },
    // A Wraithmarsh wisp that followed you home, gold now, not green.
    cr_wisp: { n: 'Gold Wisp', fly: 1, parts(f) {
      const k = kit(), outer = m('#F2A82A', 'glow', { light: '#FFB040' }), core = m('#FFE890', 'glow', { light: '#FFD060' });
      const w = f === 'idle1' || f === 'hop1' ? 1 : 0;
      // a teardrop of flame: round below, licking up and back into two tips
      k.add(1, outer, P(-2.9, -2.6, -2.2, -5.4, -3.6 - w, -8.6, -1, -6.2, .2, -9.4 + w, 1.4, -5.6, 2.8, -3.4, 2.2, -.8, 0, 0, -2, -.8), { lr: 12, pulse: 1 });
      k.add(2, core, E(0, -3, 1.7, 1.9), { nl: 1, nolight: 1 });
      if (f === 'sleep') k.add(3, eyeM, Q(0, -3, 2, 1), { nl: 1 });
      else { k.add(3, eyeM, Q(0, -4, 1, 1), { nl: 1 }); k.add(3, eyeM, Q(2, -4, 1, 1), { nl: 1 }); }
      return k.parts;
    } },
    // A hermit crab with a tiny lantern for a shell.
    cr_crab: { n: 'Lantern Crab', parts(f) {
      const k = kit(), shell = m('#D0603A'), dk = m('#7A3220', 'flat'), brass = m('#B8883E', 'metal'), glass = m('#FFD27A', 'glow', { light: '#FFC070' });
      const sh = f === 'hop0' ? 1 : f === 'hop1' ? -1 : 0, up = f === 'idle1' ? 1 : 0;
      for (let i = 0; i < 4; i++) k.add(1, dk, Q(-3 + i * 2 + (i % 2 ? sh : -sh), -1, 1, 1), { nl: 1 });
      // the lantern it lives in, sitting on its back
      k.add(1.5, brass, R(-2.6, -10.6, 1, 1.6));
      k.add(1.6, brass, P(-5.4, -8.6, .2, -8.6, -.8, -9.8, -4.4, -9.8));
      k.add(1.7, glass, R(-4.8, -8.6, 4.4, 4), { lr: 12, pulse: 1 });
      k.add(1.75, brass, R(-2.9, -8.6, .8, 4), { nl: 1 });
      k.add(1.8, brass, R(-5.4, -4.8, 5.6, 1.2));
      k.add(2, shell, E(.8, -2.6, 3.6, 2.2), { bev: 1 });
      k.add(2.2, dk, Q(3, -6 - up, 1, 2), { nl: 1 });
      eyes(k, [[3, -7 - up]], f === 'sleep');
      k.add(3, shell, E(4.6 + up * .3, -3 - up * 1.4, 1.7, 1.4), { sep: 1 });
      k.add(3.1, shell, P(5.4 + up * .3, -4.2 - up * 1.4, 7.2 + up * .3, -5 - up * 1.4, 6.6 + up * .3, -3.2 - up * 1.4), { sep: 1 });
      return k.parts;
    } }
  };
  for (const id in DEFS) DEFS[id].frames = FRAMES;
  return DEFS;
})();
