// art/area-1/ravager.mjs: the Briarbound Ravager (zone 3), drawn as parts. A squat horned soldier: hinged bark-like armour grown
// from dark flesh and a cleaver-shaped right arm (docs/design/enemies-c22-hollow-final.md). Faces LEFT. Origin = the grounded rear foot.
// Actions: idle, hop, hurt, stagger, death, cleaver (Cleaver Drop), backhand (Thorn Backhand).
import { ell, cap, poly, chain, thorn, box, ramp } from './kit.mjs';
import { ik, limb, polar } from './rig.mjs';
import { makeDef, BASE_TIMINGS } from './creature-common.mjs';

export const RAV_CELL = [128, 96], RAV_ORIGIN = [100, 88];
const M = {
  bark: ramp('#6E4D31', { shade: 0.34 }), barkD: ramp('#4A3424', { shade: 0.3 }), rust: ramp('#B5582B', { shade: 0.32 }),
  flesh: ramp('#4B2E3E', { shade: 0.3 }), fleshD: ramp('#2F2030', { shade: 0.3 }), bark2: ramp('#8A6240', { shade: 0.3 }), bone: ramp('#D8CBA4', { light: 0.3 }), boneD: ramp('#A8996F'),
  moss: ramp('#6A8238'), dark: ramp('#2A1F2E')
};
export const ravPose0 = {
  bob: 0, lean: 0.14, tilt: 0, plates: 0, jaw: 0,
  a1: 2.3, a2: 2.95, fa1: 2.45, fa2: 2.05,           // arm angles (rad; 0 = right, PI = left toward the hero, PI/2 = down)
  nfx: -19, nfy: 0, ffx: -2, ffy: 0, nfl: 0, ffl: 0,
  dx: 0, dy: 0
};

export function drawRavager(S, p, ox, oy) {
  p = Object.assign({}, ravPose0, p);
  const X = x => ox + (p.dx || 0) + x, Y = y => oy + (p.dy || 0) + y, T = (x, y) => [X(x), Y(y)];
  const add = (sd, mat, z, o) => S.add(sd, mat, z, o);
  const hip = [-7, -23 + p.bob], sh = [hip[0] + Math.sin(-p.lean) * 14 - 1, hip[1] - Math.cos(p.lean) * 14];
  const hd = [sh[0] - 6 + Math.sin(-p.tilt) * 3, sh[1] - 2 + Math.cos(p.tilt) * 0 + p.tilt * 3];
  const mid = [(hip[0] + sh[0]) / 2, (hip[1] + sh[1]) / 2];
  // ---- legs (IK, knees forward): short, thick, clawed ----
  const leg = (hx, hy, fx, fy, lift, mat, z) => {
    const ank = [fx + 2, fy - 5 - lift], [kx, ky] = ik(hx, hy, ank[0], ank[1], 11, 10, 1);
    add(limb(T(hx, hy), T(kx, ky), T(ank[0], ank[1]), 6.4, 4.8, 3.2), mat, z, { rim: 4 });
    add(cap(X(ank[0]), Y(ank[1]), 3, X(fx - 6), Y(fy - 1.8 - lift * 0.4), 2.4), mat, z, { rim: 2 });
    add(ell(X(kx - 1), Y(ky), 4.2, 3.4, 0.5), M.bark, z + 0.02, { rim: 2, tex: 0.4 });                    // a bark knee guard
    for (const dx of [-9, -6, -3]) add(thorn(X(fx - 5), Y(fy - 1.6 - lift * 0.4), X(fx + dx - 2), Y(fy + 0.3 - lift * 0.4), 2.2, 0), M.bone, z, { rim: 1.5 });
  };
  leg(hip[0] + 5, hip[1] + 1, p.ffx, p.ffy, p.ffl, M.fleshD, 1);
  // ---- far arm: a short thorned forearm with a clenched fist ----
  const farArm = () => {
    const s0 = [sh[0] + 5, sh[1] + 4], e = polar(s0[0], s0[1], p.fa1, 9), h = polar(e[0], e[1], p.fa2, 8);
    add(limb(T(...s0), T(...e), T(...h), 3.8, 3.4, 3), M.fleshD, 0.5, { rim: 2.5 });
    add(cap(X(e[0]), Y(e[1]), 3.6, X(...[(e[0] + h[0]) / 2]), Y((e[1] + h[1]) / 2), 3.4), M.barkD, 0.52, { rim: 2 });
    add(ell(X(h[0]), Y(h[1]), 3.6, 3.2), M.flesh, 0.53, { rim: 2 });
    const t = polar(e[0], e[1], p.fa2 - 0.9, 6);
    add(thorn(X(e[0]), Y(e[1]), X(t[0]), Y(t[1]), 2.8, 0), M.boneD, 0.51, { rim: 1.5 });
  };
  farArm();
  // ---- the hinged back plates: bark shingles that lift when it strikes (p.plates 0..1) ----
  for (let i = 0; i < 4; i++) {
    const u = i / 3, bx = hip[0] + (sh[0] - hip[0]) * u + 7.5, by = hip[1] + (sh[1] - hip[1]) * u - 1, lift = p.plates * (3 + u * 2);
    add(thorn(X(bx - 2), Y(by + 1), X(bx + 7 + lift), Y(by - 4 - lift * 0.6 - u), 6.4 - u, -1.2), i % 2 ? M.barkD : M.bark, 1.5, { rim: 2.5, tex: 0.5 });
    add(thorn(X(bx), Y(by + 1.5), X(bx + 5.5 + lift), Y(by - 2.2 - lift * 0.5 - u), 2.2, -0.8), M.rust, 1.55, { rim: 1.5, nl: 1 });
  }
  // ---- body: dark flesh with bark shingles hinged down the front and belly ----
  add(ell(X(mid[0]), Y(mid[1] + 1), 12.4, 14.6, -p.lean), M.flesh, 2, { rim: 5, tex: 0.5 });
  const plate = (cy, w, h, mat, z, dx = 0) => {   // a shingle across the chest, its rust rim below
    const cx = mid[0] - 3.5 + dx - (cy - mid[1]) * 0.15 * -p.lean * 0;
    add(box(X(cx), Y(cy), w, h, -p.lean * 0.4, 2), mat, z, { rim: 2.2, tex: 0.6 });
    add(box(X(cx - 0.5), Y(cy + h / 2 - 0.4), w - 1.5, 1.7, -p.lean * 0.4), M.rust, z + 0.01, { rim: 1.2, nl: 1, noLine: 1 });
  };
  plate(mid[1] - 8, 15, 6, M.bark, 2.2, 0.5);
  plate(mid[1] - 2.5, 16.5, 6.2, M.barkD, 2.3, 0);
  plate(mid[1] + 3.5, 15.5, 6, M.bark, 2.4, -0.5);
  plate(mid[1] + 9, 13, 5.5, M.barkD, 2.5, -0.5);
  add(box(X(hip[0] - 1.5), Y(hip[1] + 3), 15, 3.2, -p.lean * 0.4, 1), M.dark, 2.6, { rim: 2, nl: 1 });          // a belt of dark sinew
  add(ell(X(mid[0] + 1), Y(mid[1] - 4), 3, 2.2, 0.3), M.moss, 2.45, { rim: 1.4, tex: 0.9, nl: 1 });               // a moss patch on the bark
  // far-side pauldron (a plate peeking over the back shoulder)
  add(ell(X(sh[0] + 6), Y(sh[1] + 1), 6.2, 4.8, 0.5 - p.lean), M.barkD, 2.7, { rim: 2.5, tex: 0.5 });
  // ---- head: low and forward, a heavy bark brow over a dark face ----
  const hX = X(hd[0]), hY = Y(hd[1]);
  const horn = (x0, y0, flip, z, mat) => add(chain([[hX + x0, hY + y0, 3.3], [hX + x0 - 3 * flip, hY + y0 - 5, 2.8], [hX + x0 - 8 * flip, hY + y0 - 9, 2.1], [hX + x0 - 13 * flip, hY + y0 - 10.5, 1.3], [hX + x0 - 16 * flip, hY + y0 - 8, 0.4]]), mat, z, { rim: 2.2, hi: 1 });
  horn(5, -4, 0.55, 2.6, M.boneD);
  horn(-1, -6, 1, 3.3, M.bone);
  add(ell(hX + 0.5, hY + 1, 9.4, 8.2, -0.05 - p.tilt * 0.3), M.fleshD, 3, { rim: 4, tex: 0.4 });
  add(poly([hX - 9, hY - 4, hX - 3, hY - 7.5, hX + 8, hY - 6, hX + 9, hY - 2, hX - 2, hY - 3.4, hX - 9, hY - 2.6]), M.bark, 3.1, { rim: 2.2, tex: 0.5 });   // brow plate
  add(box(hX - 6.5, hY - 1.1, 4, 2), null, 3.4, { emit: '#FF8A3A' });                                          // an ember eye under the brow
  add(box(hX - 6.5, hY + 0.5, 4, 0.8), M.dark, 3.35, { flat: 1, nl: 1, noLine: 1 });
  const jw = Math.round(p.jaw);
  add(box(hX - 4, hY + 4.8 + jw * 0.5, 9, 2.4 + jw), M.dark, 3.3, { flat: 1, nl: 1 });
  for (const dx of [-7.5, -2.5]) add(poly([hX + dx, hY + 3.6, hX + dx + 2, hY + 3.6, hX + dx + 1, hY + 6.4 + jw * 0.5]), M.bone, 3.4, { flat: 1, nl: 1 });   // tusks
  add(poly([hX + 7, hY - 2, hX + 14, hY + 2, hX + 8.5, hY + 4.5]), M.barkD, 2.9, { rim: 1.5 });                       // a bark neck flare
  // ---- near leg ----
  leg(hip[0] - 3, hip[1] + 2, p.nfx, p.nfy, p.nfl, M.flesh, 4);
  // ---- near arm: the cleaver. A bark sleeve hinged at shoulder and elbow, a broad blade for a hand ----
  const s0 = [sh[0] - 2, sh[1] + 4], e = polar(s0[0], s0[1], p.a1, 9), h = polar(e[0], e[1], p.a2, 7);
  add(ell(X(s0[0] + 0.5), Y(s0[1] - 1.5), 8, 6, p.a1 * 0.4 - 0.4), M.bark, 4.6, { rim: 3, tex: 0.5 });                 // pauldron
  add(box(X(s0[0] - 1.5), Y(s0[1] - 0.5), 6, 2, p.a1 * 0.4 - 0.4), M.rust, 4.65, { rim: 1.2, nl: 1, noLine: 1 });
  add(limb(T(...s0), T(...e), T(...h), 5, 4.8, 4.2), M.flesh, 4.5, { rim: 3 });
  add(cap(X(e[0]), Y(e[1]), 5, X((e[0] + h[0]) / 2), Y((e[1] + h[1]) / 2), 4.6), M.bark, 4.55, { rim: 2.5, tex: 0.5 });   // forearm bark
  add(ell(X(e[0]), Y(e[1]), 4.6, 4.6), M.barkD, 4.56, { rim: 2.5 });                                                   // the elbow hinge
  const c = Math.cos(p.a2), s = Math.sin(p.a2), P = (u, v) => T(h[0] + u * c - v * s, h[1] + u * s + v * c);
  const blade = [P(-2, -4), P(7, -5.2), P(16, -7.5), P(25, -8.5), P(26, -8), P(26.5, 8), P(25, 8.5), P(16, 7.5), P(7, 5.2), P(-2, 4)];
  add(poly(blade.flat()), M.bark2, 4.7, { rim: 3.2, tex: 0.5, hi: 1 });                                                 // the blade body: grown bark
  add(poly([...P(18, -7.8), ...P(26.5, -8.4), ...P(27, 8.4), ...P(18, 7.8)]), M.rust, 4.75, { rim: 2.4, hi: 1, tex: 0.3 });   // a rust cutting face
  add(box(...P(26.4, 0), 1.6, 17, p.a2), M.bone, 4.8, { flat: 1, nl: 1, noLine: 1 });                                   // the bright edge
  add(box(...P(8, -4.4), 18, 1.8, p.a2), M.barkD, 4.72, { flat: 0, nl: 1, noLine: 1, rim: 1 });                           // the dark spine
  for (const u of [6, 13, 20]) add(thorn(...P(u, -5.5 - (u - 6) * 0.2), ...P(u - 4, -12 - (u - 6) * 0.1), 3.4, 0), M.boneD, 4.71, { rim: 1.5 });   // thorns along the spine
  return { tip: P(27, 0), mid: P(15, 0) };
}

// ---------- poses ----------
const IDLE = i => ({ bob: [0, 0.7, 1.3, 0.6][i], lean: 0.14 + [0, 0.015, 0.03, 0.015][i], a1: 2.3 + [0, 0.04, 0.08, 0.04][i], a2: 2.95 + [0, 0.04, 0.08, 0.04][i], fa1: 2.45 + [0.03, 0, -0.03, 0][i], plates: [0, 0.2, 0.4, 0.2][i] });
const HOP = [   // crouch, push, rise, peak, fall, land: a heavy short leap
  { bob: 5, lean: 0.3, a1: 2.0, a2: 2.75, fa1: 2.2, fa2: 1.8, nfx: -19, ffx: -3 },
  { bob: 1, lean: 0.35, dy: -3, nfl: 2, ffl: 2, a1: 2.5, a2: 3.30, fa1: 2.7, fa2: 2.4, plates: 0.3 },
  { bob: 0, lean: 0.3, dy: -8, nfl: 6, ffl: 6, nfx: -21, ffx: -8, a1: 2.7, a2: 3.30, fa1: 2.9, fa2: 2.7, plates: 0.6 },
  { bob: 0, lean: 0.2, dy: -10, nfl: 7, ffl: 7, nfx: -21, ffx: -8, a1: 2.6, a2: 3.30, fa1: 2.8, fa2: 2.8, plates: 0.7 },
  { bob: 0, lean: 0.2, dy: -5, nfl: 4, ffl: 4, nfx: -21, ffx: -7, a1: 2.4, a2: 3.30, fa1: 2.6, fa2: 2.4, plates: 0.4 },
  { bob: 6, lean: 0.28, a1: 2.0, a2: 2.75, fa1: 2.3, fa2: 1.9, plates: 0 }
];
const HURT = [
  { bob: 1, lean: -0.1, tilt: -0.3, a1: 1.8, a2: 2.55, fa1: 2.1, fa2: 1.7, jaw: 2, dx: 2, plates: 0.8 },
  { bob: 2, lean: -0.2, tilt: -0.5, a1: 1.5, a2: 2.25, fa1: 1.8, fa2: 1.3, jaw: 3, dx: 3, plates: 1 },
  { bob: 2, lean: -0.1, tilt: -0.3, a1: 1.8, a2: 2.55, fa1: 2.1, fa2: 1.6, jaw: 2, dx: 3, plates: 0.6 },
  { bob: 1, lean: 0.08, tilt: -0.1, a1: 2.1, a2: 2.85, fa1: 2.4, fa2: 2.0, dx: 1, plates: 0.2 }
];
const STAGGER = [
  { bob: 5, lean: 0.4, tilt: 0.2, a1: 2.0, a2: 2.75, fa1: 2.2, fa2: 1.8, nfx: -16, jaw: 1, plates: 0.4 },
  { bob: 8, lean: 0.55, tilt: 0.3, a1: 1.8, a2: 2.55, fa1: 2.0, fa2: 1.6, nfx: -16, ffx: -2, jaw: 2, dx: -2, plates: 0.8 },
  { bob: 7, lean: 0.4, tilt: 0.15, a1: 2.0, a2: 2.85, fa1: 2.3, fa2: 1.9, jaw: 1, plates: 0.8 },
  { bob: 3, lean: 0.25, a1: 2.1, a2: 2.95, fa1: 2.4, fa2: 2.0, plates: 0.3 }
];
const DEATH = [
  { bob: 2, lean: -0.15, tilt: -0.3, a1: 1.5, a2: 2.15, fa1: 1.7, fa2: 1.2, jaw: 3, dx: 3, plates: 1 },
  { bob: 7, lean: -0.35, tilt: -0.5, a1: 1.0, a2: 1.65, fa1: 1.3, fa2: 0.8, jaw: 3, dx: 5, nfx: -14, ffx: -1, plates: 1 },
  { bob: 13, lean: -0.6, tilt: -0.6, a1: 0.7, a2: 1.45, fa1: 1.0, fa2: 0.4, jaw: 3, dx: 7, nfx: -12, ffx: 1, plates: 1 },
  { bob: 17, lean: -0.9, tilt: -0.7, a1: 0.4, a2: 1.15, fa1: 0.7, fa2: 0.1, jaw: 2, dx: 8, nfx: -12, ffx: 2, plates: 0.7 }
];
// Cleaver Drop (14 frames): ready, coil, the arm rises; a fixed overhead hold (4..7) with plates lifting; drop (8..10, contact 10); recover.
const CLEAVER = [
  [1, {}], [2, { bob: 2.5, lean: 0.05, a1: 2.6, a2: 2.9, plates: 0.3 }], [3, { bob: 1.5, lean: -0.05, a1: 3.9, a2: 3.9, plates: 0.6 }],
  [4, { bob: 0, lean: -0.1, a1: 4.8, a2: 5.0, plates: 1, dx: 1 }], [5, { bob: 0, lean: -0.1, a1: 4.8, a2: 5.0, plates: 1, dx: 1 }],
  [6, { bob: 0.2, lean: -0.1, a1: 4.8, a2: 5.0, plates: 1, dx: 1 }], [7, { bob: 0, lean: -0.1, a1: 4.8, a2: 5.0, plates: 1, dx: 1 }],
  [8, { bob: 1.5, lean: 0.0, a1: 5.0, a2: 5.4, plates: 1, dx: 2 }], [9, { bob: 4, lean: 0.4, a1: 3.3, a2: 3.4, plates: 0.4, dx: -6, nfx: -22 }],
  [10, { bob: 2, lean: 0.45, a1: 2.45, a2: 2.4, plates: 0, dx: -9, nfx: -23 }], [11, { bob: 2, lean: 0.45, a1: 2.45, a2: 2.4, plates: 0, dx: -9, nfx: -23 }],
  [12, { bob: 2.5, lean: 0.4, a1: 2.35, a2: 2.6, dx: -6 }], [13, { bob: 2, lean: 0.25, a1: 2.3, a2: 2.5, dx: -3 }], [14, { bob: 0.5, dx: -1 }]
];
// Thorn Backhand (16 frames): the shoulder unfolds first (arm drawn back and low), then the elbow snaps: hit 1 sweeping forward, a recoil, hit 2.
// (a2 runs -5.15 cocked right to -3.3 pointing left, so every sweep goes through the low arc)
const BACKHAND = [
  [1, { a1: 2.3, a2: -3.33 }], [2, { bob: 1.5, lean: 0.1, a1: 1.5, a2: -4.6, plates: 0.3 }], [3, { bob: 2, lean: 0.02, a1: 0.9, a2: -5.3, plates: 0.6, dx: 0 }],
  [4, { bob: 2.5, lean: 0, a1: 1.0, a2: -5.15, plates: 0.8, dx: 1 }], [5, { bob: 2.5, lean: 0, a1: 1.0, a2: -5.15, plates: 0.8, dx: 1 }],
  [6, { bob: 2.5, lean: 0.15, a1: 1.2, a2: -5.0, plates: 0.7, dx: 0 }], [7, { bob: 3, lean: 0.25, a1: 1.8, a2: -4.2, plates: 0.5, dx: -4 }],
  [8, { bob: 3, lean: 0.35, a1: 2.8, a2: -3.3, plates: 0.2, dx: -8, nfx: -23 }], [9, { bob: 3, lean: 0.35, a1: 2.9, a2: -3.15, plates: 0.2, dx: -8, nfx: -23 }],
  [10, { bob: 3, lean: 0.2, a1: 2.1, a2: -4.0, plates: 0.5, dx: -5 }], [11, { bob: 3, lean: 0, a1: 1.1, a2: -5.0, plates: 0.8, dx: 0 }],
  [12, { bob: 3, lean: 0.38, a1: 2.7, a2: -3.4, plates: 0.2, dx: -9, nfx: -23 }], [13, { bob: 3, lean: 0.38, a1: 2.9, a2: -3.2, plates: 0.2, dx: -9, nfx: -23 }],
  [14, { bob: 2.5, lean: 0.3, a1: 2.6, a2: -3.1, dx: -6 }], [15, { bob: 1, lean: 0.2, a1: 2.4, a2: -3.2, dx: -2 }], [16, { a1: 2.3, a2: -3.33 }]
];

export function ravagerDef() {
  const T = {
    ...BASE_TIMINGS,
    cleaver: { loop: 0, start: 2, end: 13, rel: [8], con: [10], ms: [550, 140, 160, 260, 320, 260, 140, 70, 60, 60, 120, 140, 130, 120], atk: true, hit: true },
    backhand: { loop: 0, start: 2, end: 14, rel: [7, 11], con: [8, 12], ms: [400, 150, 200, 260, 260, 150, 60, 70, 100, 90, 60, 70, 100, 130, 130, 120], atk: true, hit: true }
  };
  return makeDef({
    key: 'ravager', cell: RAV_CELL, origin: RAV_ORIGIN, pose0: ravPose0, draw: drawRavager, timings: T, hopMove: [140, 380],
    idle: IDLE, hop: HOP, hurt: HURT, stagger: STAGGER, death: DEATH,
    moves: {
      cleaver: { keys: CLEAVER, who: () => 'tip', contacts: [10], windows: [[8, 11]], trail: ['#F4C9A0', '#FFFFFF'], spark: ['#FF7A3A', '#FFF3B8'], sparkDx: 0, sparkDy: -1, sparkScale: 1.3 },
      backhand: { keys: BACKHAND, who: () => 'tip', contacts: [8, 12], windows: [[6, 9], [11, 13]], trail: ['#F4C9A0', '#FFFFFF'], spark: ['#FF7A3A', '#FFF3B8'], sparkDx: 0 }
    }
  });
}
