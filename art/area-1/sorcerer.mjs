// art/area-1/sorcerer.mjs: the Nightseed Sorcerer (zone 5), drawn as parts. A small masked caster in a deep violet hood, a floating seed-shaped
// heart held between three rigid root claws; it has never been a plant (docs/design/enemies-c22-hollow-final.md). Faces LEFT.
// It floats: no legs and no shadow, origin = the ground point below it. Actions: idle, hop (a drift), hurt, stagger, death, lance (Root Lance), pulse (Seed Pulse).
import { ell, cap, poly, chain, thorn, box, sub, ramp } from './kit.mjs';
import { ik, limb, polar } from './rig.mjs';
import { makeDef, BASE_TIMINGS, FX_CELL, FX_ORIGIN } from './creature-common.mjs';
import { Sprite, blankImg } from './kit.mjs';

export const SO_CELL = [128, 112], SO_ORIGIN = [92, 104];
const M = {
  robe: ramp('#3A2455', { shade: 0.34, shadeTo: '#1A0F2A' }), hood: ramp('#54307A', { shade: 0.34, shadeTo: '#1A0F2A' }), root: ramp('#6E4D31', { shade: 0.34 }),
  rootD: ramp('#4A3424', { shade: 0.3 }), bone: ramp('#DCD0AC', { light: 0.3 }), boneD: ramp('#A8996F'), seed: ramp('#B63FA0', { shade: 0.34, shadeTo: '#2A0F3A', light: 0.3 }),
  dark: ramp('#1E1424')
};
export const soPose0 = {
  bob: 0, dx: 0, dy: 0, tilt: 0, sw: 0, droop: 0,
  hs: 1, hx: -33, hy: -5,        // the heart: scale and offset from the chest
  ln: 0, la: 3.0,                  // Root Lance: 0..1 how far the front claw has straightened into a spear, and its angle
  c0: 0, c2: 0, eye: 0
};
const CL = 14;   // claw segment length

export function drawSorcerer(S, p, ox, oy) {
  p = Object.assign({}, soPose0, p);
  const X = x => ox + (p.dx || 0) + x, Y = y => oy + (p.dy || 0) + y, add = (sd, mat, z, o) => S.add(sd, mat, z, o);
  const C = [4, -32 + p.bob], ct = Math.cos(p.tilt), st = Math.sin(p.tilt);
  const R = (x, y) => [C[0] + x * ct + y * st, C[1] + y * ct - x * st];   // body-local (relative to the chest) with a lean
  const hem = -9 + p.bob * 0.6, tips = {};
  // ---- tattered hem: the robe ends in hanging root-thorns, it has no feet ----
  for (let i = 0; i < 5; i++) { const bx = -4 + i * 4.6 + p.tilt * -6, sway = Math.sin(i * 1.7) * 1.5 + p.sw * (1 + i * 0.2);
    add(thorn(X(bx), Y(hem - 4 + i % 2), X(bx + sway - 1.2), Y(hem + 7 + (i % 2) * 2 - Math.abs(i - 2) * 0.8), 5.2, sway * 0.4), i % 2 ? M.robe : M.hood, 1.2, { rim: 2, tex: 0.5 }); }
  // ---- far claw (behind the body) is claw 0's partner: all three claws are drawn from the same arms ----
  const Hc = R(p.hx, p.hy);
  const Hx = Hc[0], Hy = Hc[1], r0 = p.hs * 1.2 * 6.4 + 2.2;
  const claw = (anchor, ang, dir, z, mat, isLance) => {
    const a = R(...anchor), ln = isLance ? p.ln : 0, sc = 1 + 0.75 * ln;
    const cx = Hx + Math.cos(ang) * r0, cy = Hy + Math.sin(ang) * r0;
    const sx = a[0] + Math.cos(p.la) * CL * 2 * sc, sy = a[1] + Math.sin(p.la) * CL * 2 * sc;
    const tx = cx + (sx - cx) * ln, ty = cy + (sy - cy) * ln, [mx, my, ex, ey] = ik(a[0], a[1], tx, ty, CL * sc, CL * sc, ln > 0.6 ? 1 : dir);
    add(limb([X(a[0]), Y(a[1])], [X(mx), Y(my)], [X(ex), Y(ey)], 2.5, 2.0 + ln * 0.2, 1.3), mat, z, { rim: 2.4, tex: 0.4 });
    add(ell(X(mx), Y(my), 2.8, 2.8), M.rootD, z + 0.02, { rim: 1.6 });                                      // a knuckle: the claws are rigid, they only hinge here
    const toH = Math.atan2(Hy - ey, Hx - ex), al = Math.atan2(ey - my, ex - mx), da = ((al - toH + Math.PI * 3) % (Math.PI * 2)) - Math.PI, hk = al - da * (1 - ln), hl = 4.5 + ln * 6;
    add(thorn(X(ex), Y(ey), X(ex + Math.cos(hk) * hl), Y(ey + Math.sin(hk) * hl), 3.4 + ln * 1.4, 0), isLance ? M.bone : M.boneD, z + 0.03, { rim: 1.5, hi: 1 });   // a hooked tip (a spearhead when straight)
    return [ex + Math.cos(hk) * hl, ey + Math.sin(hk) * hl];
  };
  // ---- body: the robe, a hunched hood, a bone mask ----
  const t = R(0, 0);
  add(ell(X(t[0] + 1), Y(t[1] + 1), 10.5, 18.5, -p.tilt * 0.8), M.robe, 2, { rim: 6, tex: 0.5 });
  add(box(X(t[0] - 4), Y(t[1] + 6), 2.2, 14, -0.1), M.hood, 2.1, { rim: 1.6, nl: 1, noLine: 1 });             // a fold in the robe
  add(ell(X(t[0] - 6), Y(t[1] - 8), 6.5, 4.4, 0.4), M.hood, 2.2, { rim: 2.4, tex: 0.5 });                      // the near shoulder
  const hd = R(-3 - p.droop * 0.2, -17 + p.droop);
  add(thorn(X(hd[0] + 4), Y(hd[1] - 3), X(hd[0] + 17), Y(hd[1] - 10), 8, -3), M.hood, 2.8, { rim: 3 });         // the hood's peak sweeps back like a thorn
  add(ell(X(hd[0]), Y(hd[1]), 9.4, 10, -0.1), M.hood, 3, { rim: 4.6, tex: 0.5 });
  add(ell(X(hd[0] - 3), Y(hd[1] + 1.3), 5.2, 6.6, -0.1), M.dark, 3.1, { flat: 1, nl: 1 });                      // the shadow inside the hood
  add(ell(X(hd[0] - 4), Y(hd[1] + 1), 4.8, 6, -0.1), M.bone, 3.2, { rim: 3.2, hi: 1 });                         // the mask
  add(box(X(hd[0] - 6.7), Y(hd[1] - 0.6), 3.2, 1.6), M.dark, 3.3, { flat: 1, nl: 1 });
  add(box(X(hd[0] - 6.8), Y(hd[1] - 0.6), 2, 1 + (p.eye > 0.5 ? 0.6 : 0)), null, 3.4, { emit: p.eye > 0.5 ? '#FFD0F4' : '#FF5AD8' });
  add(box(X(hd[0] - 3.4), Y(hd[1] + 3.4), 2, 3.2), M.dark, 3.3, { flat: 1, nl: 1 });                            // a long slit of a mouth
  // ---- the three claws and the heart between them ----
  const A = [[-8, -2], [-9, 4], [-8, 10]];
  tips.c0 = claw(A[0], -1.5 + p.c0, 1, 3.6, M.root, false);
  tips.c2 = claw(A[2], 1.5 + p.c2, -1, 3.6, M.rootD, false);
  tips.lance = claw(A[1], Math.PI, 1, 4.2, M.root, true);
  // the seed: an almond with a pointed top, a glow core
  const hs = p.hs * 1.2, hX = X(Hx), hY = Y(Hy);
  add(ell(hX, hY + 1, 5.6 * hs, 7.6 * hs, 0.2), M.seed, 3.2, { rim: 4 * hs, tex: 0.3 });
  add(thorn(hX + 1.5 * hs, hY - 4 * hs, hX + 3 * hs, hY - 11 * hs, 5.4 * hs, -1), M.seed, 3.15, { rim: 2.4 });
  add(ell(hX - 0.6 * hs, hY + 1.2 * hs, 2.7 * hs, 4 * hs, 0.2), null, 3.3, { emit: '#FF8AE4' });
  add(ell(hX - 1.1 * hs, hY + 0.6 * hs, 1.2 * hs, 2 * hs, 0.2), null, 3.4, { emit: '#FFF0FA' });
  tips.heart = [Hx, Hy];
  tips.tip = tips.lance;
  return tips;
}

// ---------- poses ----------
const IDLE = i => ({ bob: [0, -1.4, -2.4, -1][i], hy: -5 + [0, -1, -1.5, -0.6][i], hs: 1 + [0, 0.04, 0.08, 0.04][i], sw: [0, 0.8, 1.6, 0.8][i], c0: [0, 0.06, 0.12, 0.06][i], c2: [0, -0.06, -0.12, -0.06][i], tilt: [0, 0.01, 0.02, 0.01][i] });
const HOP = [
  { bob: 1, tilt: -0.05, sw: 1.5, hs: 0.9 }, { bob: -3, dy: -2, tilt: 0.06, sw: 3, hx: -31, hs: 1 }, { bob: -4, dy: -5, tilt: 0.14, sw: 4, hx: -34, hy: -5, hs: 1.05 },
  { bob: -4, dy: -6, tilt: 0.14, sw: 4, hx: -34, hy: -5, hs: 1.05 }, { bob: -3, dy: -3, tilt: 0.08, sw: 2.5, hs: 1 }, { bob: 0, tilt: 0, sw: 1, hs: 1 }
];
const HURT = [
  { bob: 1, dx: 3, tilt: -0.15, sw: -2, hs: 0.8, hx: -30, droop: 2, eye: 1 }, { bob: 2, dx: 6, tilt: -0.28, sw: -3, hs: 0.65, hx: -28, droop: 3, c0: 0.4, c2: -0.4, eye: 1 },
  { bob: 1, dx: 4, tilt: -0.16, sw: -2, hs: 0.85, hx: -30, droop: 2, eye: 1 }, { bob: 0, dx: 1, tilt: -0.04, sw: -0.5, hs: 0.95 }
];
const STAGGER = [
  { bob: 2, tilt: 0.2, sw: 2, hs: 0.8, droop: 2, c0: 0.3, c2: -0.3 }, { bob: 5, dy: 3, dx: -1, tilt: 0.36, sw: 3, hs: 0.7, hx: -30, droop: 4, c0: 0.5, c2: -0.5 },
  { bob: 4, dy: 3, tilt: 0.3, sw: 2, hs: 0.75, hx: -30, droop: 3, c0: 0.4, c2: -0.4 }, { bob: 1, dy: 1, tilt: 0.12, sw: 1, hs: 0.95 }
];
const DEATH = [
  { bob: 1, dx: 3, tilt: -0.2, sw: -2, hs: 0.8, droop: 3, eye: 1 }, { bob: 4, dx: 5, dy: 5, tilt: -0.4, sw: -3, hs: 0.7, hx: -26, hy: -8, droop: 5, c0: 0.6, c2: -0.6 },
  { bob: 7, dx: 6, dy: 12, tilt: -0.6, sw: -3, hs: 0.6, hx: -22, hy: -14, droop: 7, c0: 0.8, c2: -0.8 }, { bob: 8, dx: 7, dy: 20, tilt: -0.75, sw: -2, hs: 0.5, hx: -18, hy: -22, droop: 8, c0: 1, c2: -1 }
];
// Root Lance (14 frames): the front claw draws back; it straightens into a spear (3..7, long hold); the spear thrusts (contact 9); it folds back.
const LANCE = [
  [1, {}], [2, { bob: 1, tilt: -0.06, hs: 0.9, hx: -30, ln: 0.0, c0: 0.25, c2: -0.25 }], [3, { bob: 0, tilt: -0.08, hs: 0.85, hx: -27, hy: -7, ln: 0.35, la: 3.1, c0: 0.4, c2: -0.3 }],
  [4, { bob: -1, tilt: -0.1, hs: 0.8, hx: -25, hy: -9, ln: 0.8, la: 3.15, c0: 0.5, c2: -0.35, dx: 3 }], [5, { bob: -1, tilt: -0.1, hs: 0.8, hx: -25, hy: -9, ln: 1, la: 3.15, c0: 0.5, c2: -0.35, dx: 3, eye: 1 }],
  [6, { bob: -1, tilt: -0.1, hs: 0.8, hx: -25, hy: -9, ln: 1, la: 3.1, c0: 0.5, c2: -0.35, dx: 3 }], [7, { bob: -1, tilt: -0.1, hs: 0.8, hx: -25, hy: -9, ln: 1, la: 3.08, c0: 0.5, c2: -0.35, dx: 3, eye: 1 }],
  [8, { bob: 0, tilt: 0.1, hs: 0.8, hx: -25, hy: -9, ln: 1, la: 3.0, c0: 0.5, c2: -0.35, dx: -4 }], [9, { bob: 1, tilt: 0.2, hs: 0.8, hx: -25, hy: -9, ln: 1, la: 2.95, c0: 0.5, c2: -0.35, dx: -11, sw: 3, eye: 1 }],
  [10, { bob: 1, tilt: 0.2, hs: 0.8, hx: -25, hy: -9, ln: 1, la: 2.95, c0: 0.5, c2: -0.35, dx: -11, sw: 3 }], [11, { bob: 0, tilt: 0.1, hs: 0.9, hx: -28, hy: -6, ln: 0.5, la: 3.0, c0: 0.3, c2: -0.2, dx: -6 }],
  [12, { bob: 0, tilt: 0.05, hs: 0.95, ln: 0.1, c0: 0.1, dx: -3 }], [13, { dx: -1 }], [14, {}]
];
// Seed Pulse (14 frames): the heart draws in, swells and releases twice (contacts 5 and 10); the claws are pushed wide each time.
const PULSE = [
  [1, {}], [2, { bob: 0.5, tilt: -0.05, hs: 0.8, hx: -30, c0: -0.15, c2: 0.15 }], [3, { bob: -1, hs: 1.3, hx: -33, c0: 0.3, c2: -0.3, eye: 1 }],
  [4, { bob: -2, tilt: 0.06, hs: 1.7, hx: -35, c0: 0.55, c2: -0.55, eye: 1 }], [5, { bob: -2, tilt: 0.08, hs: 2.0, hx: -36, c0: 0.7, c2: -0.7, eye: 1 }],
  [6, { bob: -1, hs: 1.1, hx: -33, c0: 0.2, c2: -0.2 }], [7, { bob: 0.5, tilt: -0.05, hs: 0.8, hx: -30, c0: -0.15, c2: 0.15 }],
  [8, { bob: -1, hs: 1.4, hx: -33, c0: 0.35, c2: -0.35, eye: 1 }], [9, { bob: -2, tilt: 0.06, hs: 1.8, hx: -35, c0: 0.6, c2: -0.6, eye: 1 }],
  [10, { bob: -2, tilt: 0.08, hs: 2.1, hx: -36, c0: 0.75, c2: -0.75, eye: 1 }], [11, { bob: -1, hs: 1.4, hx: -34, c0: 0.4, c2: -0.4 }],
  [12, { bob: -0.5, hs: 1.0, c0: 0.1, c2: -0.1 }], [13, { hs: 1.03 }], [14, {}]
];

// the pulse rings: an expanding ring round the heart, and a violet burst where it lands (the fx cell sits at the body origin)
function pulseFx(i, ctx) {
  const j = i + 1, atk = blankImg(...FX_CELL), hit = blankImg(...FX_CELL), P = ctx.key(i);
  const hx = FX_ORIGIN[0] + (P.dx || 0) + 4 + P.hx, hy = FX_ORIGIN[1] + (P.dy || 0) - 32 + P.bob + P.hy;
  const waves = [[3, 4, 2.0], [8, 9, 2.1]];
  for (const [a, b] of waves) if (j >= a && j <= b + 1) {
    const S = new Sprite(...FX_CELL, { noOutline: true }), u = (j - a) / (b + 1 - a), rr = 9 + u * 18;
    S.add(sub(ell(hx, hy, rr, rr), ell(hx, hy, rr - 2.4, rr - 2.4)), null, 1, { emit: '#E060D0' });
    S.add(sub(ell(hx, hy, rr - 0.4, rr - 0.4), ell(hx, hy, rr - 1.6, rr - 1.6)), null, 2, { emit: '#FFD0F4' });
    Object.assign(atk, S.render());
  }
  for (const c of [5, 10]) if (j === c || j === c + 1) {
    const S = new Sprite(...FX_CELL, { noOutline: true }), x = hx - 20 - (j - c) * 6, r = j === c ? 6 : 9;
    for (let q = 0; q < 6; q++) { const a = q / 6 * Math.PI * 2 + 0.4; S.add(ell(x + Math.cos(a) * r, hy + Math.sin(a) * r, 2.2, 2.2), null, 1, { emit: '#E060D0' }); }
    S.add(ell(x, hy, r * 0.5, r * 0.5), null, 2, { emit: '#FFF0FA' });
    Object.assign(hit, S.render());
  }
  return { atk, hit };
}

export function sorcererDef() {
  const T = {
    ...BASE_TIMINGS,
    idle: { ...BASE_TIMINGS.idle, ms: [240, 280, 280, 240] },
    hop: { ...BASE_TIMINGS.hop, ms: [130, 80, 130, 110, 120, 160] },
    lance: { loop: 0, start: 2, end: 13, rel: [8], con: [9], ms: [520, 140, 200, 240, 300, 300, 260, 90, 60, 80, 130, 130, 110, 100], atk: true, hit: true },
    pulse: { loop: 0, start: 2, end: 12, rel: [4, 9], con: [5, 10], ms: [450, 140, 110, 100, 110, 130, 140, 110, 100, 110, 140, 130, 110, 100], atk: true, hit: true }
  };
  return makeDef({
    key: 'sorcerer', cell: SO_CELL, origin: SO_ORIGIN, pose0: soPose0, draw: drawSorcerer, timings: T, hopMove: [130, 400],
    idle: IDLE, hop: HOP, hurt: HURT, stagger: STAGGER, death: DEATH, liftPx: 5,
    moves: {
      lance: { keys: LANCE, who: () => 'tip', contacts: [9], windows: [[8, 10]], trail: ['#F0C8F8', '#FFFFFF'], spark: ['#E060D0', '#FFF0FA'], sparkDx: 0 },
      pulse: { keys: PULSE, who: () => 'heart', contacts: [5, 10], windows: [], fx: pulseFx }
    }
  });
}
