// art/area-1/ravager.mjs: the Briarbound Ravager (zone 3), drawn as parts. A squat horned soldier: hinged bark-like armour grown
// from dark flesh and a cleaver-shaped right arm (docs/design/enemies-c22-hollow-final.md). Faces LEFT. Origin = the grounded rear foot.
// Actions: idle, hop, hurt, stagger, death, cleaver (Cleaver Drop), backhand (Thorn Backhand).
import { ell, cap, poly, chain, thorn, box, ramp } from './kit.mjs';
import { ik, limb, polar } from './rig.mjs';
import { makeDef, BASE_TIMINGS } from './creature-common.mjs';

export const RAV_CELL = [128, 96], RAV_ORIGIN = [100, 88];
const M = {
  bark: ramp('#5F6682', { shade: 0.38, shadeTo: '#1B1236' }), barkD: ramp('#3B4066', { shade: 0.36, shadeTo: '#150E2C' }), rust: ramp('#D4622B', { shade: 0.34 }),
  flesh: ramp('#4A2C80', { shade: 0.36, shadeTo: '#1A0C34' }), fleshD: ramp('#2D1B5A', { shade: 0.34, shadeTo: '#120A28' }), bone: ramp('#E2D6B0', { light: 0.3 }), boneD: ramp('#B0A27A'),
  blade: ramp('#4A5478', { shade: 0.36, shadeTo: '#150E2C' }), edge: ramp('#D8DEEA', { light: 0.1 }), dark: ramp('#241A38')
};
const EMBER = '#FF7A2A';
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
  const hd = [sh[0] - 6 + Math.sin(-p.tilt) * 3, sh[1] - 2 + p.tilt * 3];
  const mid = [(hip[0] + sh[0]) / 2, (hip[1] + sh[1]) / 2];
  // an angular plate: points are local (x, y) around a centre, turned by `rot`
  const plate = (cx, cy, pts, rot, mat, z, o = {}) => { const c = Math.cos(rot), s = Math.sin(rot); return add(poly(pts.flatMap(([x, y]) => [X(cx + x * c - y * s), Y(cy + x * s + y * c)])), mat, z, Object.assign({ rim: 2.4, tex: 0.15 }, o)); };
  const seam = (x0, y0, x1, y1, z) => add(cap(X(x0), Y(y0), 0.55, X(x1), Y(y1), 0.55), null, z, { emit: EMBER });   // an ember-orange seam between plates
  // ---- legs (IK, knees forward): short, thick, clawed ----
  const leg = (hx, hy, fx, fy, lift, mat, z) => {
    const ank = [fx + 2, fy - 5 - lift], [kx, ky] = ik(hx, hy, ank[0], ank[1], 11, 10, 1);
    add(limb(T(hx, hy), T(kx, ky), T(ank[0], ank[1]), 6.4, 4.8, 3.2), mat, z, { rim: 4 });
    add(cap(X(ank[0]), Y(ank[1]), 3, X(fx - 6), Y(fy - 1.8 - lift * 0.4), 2.4), mat, z, { rim: 2 });
    plate(kx - 1.5, ky, [[-4, 0], [0, -4.4], [4, -1], [2.4, 4], [-2.6, 3.4]], 0.2, M.bark, z + 0.02);          // an angular knee guard
    for (const dx of [-9, -6, -3]) add(thorn(X(fx - 5), Y(fy - 1.6 - lift * 0.4), X(fx + dx - 2), Y(fy + 0.3 - lift * 0.4), 2.2, 0), M.bone, z, { rim: 1.5, tex: 0 });
  };
  leg(hip[0] + 5, hip[1] + 1, p.ffx, p.ffy, p.ffl, M.fleshD, 1);
  // ---- far arm: a short thorned forearm with a clenched fist ----
  {
    const s0 = [sh[0] + 5, sh[1] + 4], e = polar(s0[0], s0[1], p.fa1, 9), h = polar(e[0], e[1], p.fa2, 8);
    add(limb(T(...s0), T(...e), T(...h), 3.8, 3.4, 3), M.fleshD, 0.5, { rim: 2.5 });
    plate(e[0], e[1], [[-3.6, -2], [1, -3.6], [3.6, 1], [-1, 3.4]], p.fa2, M.barkD, 0.52);
    add(ell(X(h[0]), Y(h[1]), 3.6, 3.2), M.flesh, 0.53, { rim: 2 });
    const t = polar(e[0], e[1], p.fa2 - 0.9, 6);
    add(thorn(X(e[0]), Y(e[1]), X(t[0]), Y(t[1]), 2.8, 0), M.boneD, 0.51, { rim: 1.5, tex: 0 });
  }
  // ---- the hinged back plates: bark shingles that lift when it strikes (p.plates 0..1) ----
  for (let i = 0; i < 4; i++) {
    const u = i / 3, bx = hip[0] + (sh[0] - hip[0]) * u + 7.5, by = hip[1] + (sh[1] - hip[1]) * u - 1, lift = p.plates * (3 + u * 2);
    add(poly([X(bx - 2), Y(by + 3), X(bx - 1), Y(by - 3), X(bx + 8 + lift), Y(by - 5 - lift * 0.6 - u), X(bx + 4), Y(by + 3)]), i % 2 ? M.barkD : M.bark, 1.5, { rim: 2.5, tex: 0.15 });
    add(cap(X(bx + 2), Y(by + 2.6), 0.9, X(bx + 7 + lift), Y(by - 3.6 - lift * 0.6 - u), 0.5), M.rust, 1.55, { rim: 1, nl: 1, noLine: 1 });
  }
  // ---- body: dark flesh with angular bark plates hinged down the front and belly ----
  add(ell(X(mid[0]), Y(mid[1] + 1), 12.4, 14.6, -p.lean), M.flesh, 2, { rim: 5, tex: 0.15 });
  const row = (cy, w, h, mat, z, dx) => {
    const cx = mid[0] - 3.5 + dx;
    plate(cx, cy, [[-w / 2 + 1.5, -h / 2], [w / 2, -h / 2], [w / 2 - 1.5, h / 2], [-w / 2, h / 2]], -p.lean * 0.4, mat, z);
    add(box(X(cx - 0.5), Y(cy + h / 2 + 0.3), w - 2, 1.6, -p.lean * 0.4), M.rust, z + 0.01, { rim: 1.2, nl: 1, noLine: 1, tex: 0 });
    seam(cx - w / 2 + 2, cy + h / 2 + 1.6, cx + w / 2 - 2, cy + h / 2 + 1.6, z + 0.02);
  };
  row(mid[1] - 8, 15, 5.4, M.bark, 2.2, 0.5); row(mid[1] - 2.2, 16.5, 5.6, M.barkD, 2.3, 0); row(mid[1] + 3.6, 15.5, 5.4, M.bark, 2.4, -0.5); row(mid[1] + 9, 13, 5, M.barkD, 2.5, -0.5);
  add(box(X(hip[0] - 1.5), Y(hip[1] + 3), 15, 3.2, -p.lean * 0.4, 1), M.dark, 2.6, { rim: 2, nl: 1, tex: 0 });
  plate(sh[0] + 6, sh[1] + 1, [[-6, 1], [-2, -5], [5, -4.4], [6.4, 2], [0, 4.6]], 0.3 - p.lean, M.barkD, 2.7);   // far-side pauldron
  // ---- head: low and forward, a heavy bark brow over a dark face ----
  const hX = X(hd[0]), hY = Y(hd[1]);
  const horn = (x0, y0, flip, z, mat) => add(chain([[hX + x0, hY + y0, 3.3], [hX + x0 - 3 * flip, hY + y0 - 5, 2.8], [hX + x0 - 8 * flip, hY + y0 - 9, 2.1], [hX + x0 - 13 * flip, hY + y0 - 10.5, 1.3], [hX + x0 - 16 * flip, hY + y0 - 8, 0.4]]), mat, z, { rim: 2.2, tex: 0 });
  horn(5, -4, 0.55, 2.6, M.boneD);
  horn(-1, -6, 1, 3.3, M.bone);
  add(ell(hX + 0.5, hY + 1, 9.4, 8.2, -0.05 - p.tilt * 0.3), M.fleshD, 3, { rim: 4, tex: 0.1 });
  add(poly([hX - 9, hY - 4, hX - 3, hY - 7.5, hX + 8, hY - 6, hX + 9, hY - 2, hX - 2, hY - 3.4, hX - 9, hY - 2.6]), M.bark, 3.1, { rim: 2.2, tex: 0.15 });   // brow plate
  add(box(hX - 6.5, hY - 1.1, 4, 2), null, 3.4, { emit: '#FF8A3A' });
  add(box(hX - 6.5, hY + 0.5, 4, 0.8), M.dark, 3.35, { flat: 1, nl: 1, noLine: 1 });
  const jw = Math.round(p.jaw);
  add(box(hX - 4, hY + 4.8 + jw * 0.5, 9, 2.4 + jw), M.dark, 3.3, { flat: 1, nl: 1 });
  for (const dx of [-7.5, -2.5]) add(poly([hX + dx, hY + 3.6, hX + dx + 2, hY + 3.6, hX + dx + 1, hY + 6.4 + jw * 0.5]), M.bone, 3.4, { flat: 1, nl: 1 });   // tusks
  add(poly([hX + 7, hY - 2, hX + 14, hY + 2, hX + 8.5, hY + 4.5]), M.barkD, 2.9, { rim: 1.5 });
  // ---- near leg ----
  leg(hip[0] - 3, hip[1] + 2, p.nfx, p.nfy, p.nfl, M.flesh, 4);
  // ---- near arm: the cleaver is grown out of the forearm: flesh shoulder and elbow, then one broad flat blade that is the forearm's own bone ----
  const s0 = [sh[0] - 2, sh[1] + 4], e = polar(s0[0], s0[1], p.a1, 9), h = polar(e[0], e[1], p.a2, 7);
  plate(s0[0], s0[1] - 1, [[-8, 2], [-3, -6], [5, -5.4], [8, 1.5], [1, 5]], p.a1 * 0.4 - 0.4, M.bark, 4.6);                            // angular pauldron
  add(cap(X(s0[0] - 3), Y(s0[1] + 3.2), 0.9, X(s0[0] + 4), Y(s0[1] + 3.6), 0.6), null, 4.65, { emit: EMBER });
  add(limb(T(...s0), T(...e), T(...h), 5, 4.8, 4.2), M.flesh, 4.5, { rim: 3, tex: 0.1 });
  const c = Math.cos(p.a2), s = Math.sin(p.a2), P = (u, v) => T(h[0] + u * 0.9 * c - v * 0.92 * s, h[1] + u * 0.9 * s + v * 0.92 * c);
  const blade = [P(-6, -3.6), P(6, -5.4), P(20, -6), P(31, -5.4), P(32.5, 3), P(28, 9.4), P(18, 10.6), P(8, 8), P(-1, 5.6), P(-6, 4)];
  add(poly(blade.flat()), M.blade, 4.7, { rim: 3.4, tex: 0.1 });                                                                   // the blade: broad and flat
  add(poly([...P(-6, -3.6), ...P(6, -5.4), ...P(20, -6), ...P(31, -5.4), ...P(31, -3.4), ...P(20, -3.8), ...P(6, -3.2), ...P(-6, -1.4)]), M.barkD, 4.72, { rim: 1.5, nl: 1, tex: 0 });   // a tapering dark spine
  add(chain([[...P(2, 6)], [...P(10, 9)], [...P(20, 10.2)], [...P(28, 8.8)], [...P(32.3, 2.6)]].map(([x, y], i) => [x, y, 1.1])), M.edge, 4.78, { rim: 1.2, nl: 1, noLine: 1, tex: 0 });   // the lighter cutting edge
  add(cap(...P(8, 1.6), 0.6, ...P(15, 2.6), 0.6), null, 4.8, { emit: EMBER }); add(cap(...P(19, 0.8), 0.6, ...P(27, 2.2), 0.6), null, 4.8, { emit: EMBER });   // ember seams in the blade
  for (const u of [3, 10, 17, 24]) add(thorn(...P(u, -5.4), ...P(u - 3.4, -11.5 + (u > 16 ? 1.2 : 0)), 3.2, 0), M.boneD, 4.71, { rim: 1.5, tex: 0 });   // thorns along the spine
  plate(e[0], e[1], [[-4.6, -1], [-1, -4.6], [4, -3], [4, 2.6], [-1.4, 4.4]], p.a2 + 0.3, M.barkD, 4.76);                           // the hinged elbow plate
  return { tip: P(32.5, 0), mid: P(18, 0) };
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
  [8, { bob: 1.5, lean: 0.0, a1: 5.0, a2: 5.4, plates: 1, dx: 2 }], [9, { bob: 2, lean: 0.3, a1: 3.0, a2: 3.2, plates: 0.4, dx: -6, nfx: -22 }],
  [10, { bob: 0, lean: 0.35, a1: 2.2, a2: 2.25, plates: 0, dx: -9, nfx: -23 }], [11, { bob: 0, lean: 0.35, a1: 2.2, a2: 2.25, plates: 0, dx: -9, nfx: -23 }],
  [12, { bob: 1.5, lean: 0.3, a1: 2.3, a2: 2.5, dx: -6 }], [13, { bob: 2, lean: 0.25, a1: 2.3, a2: 2.5, dx: -3 }], [14, { bob: 0.5, dx: -1 }]
];
// Thorn Backhand (16 frames): the shoulder unfolds first (arm drawn back and low), then the elbow snaps: hit 1 sweeping forward, a recoil, hit 2.
// (a2 runs -5.95 cocked right to -3.3 pointing left, so every sweep goes through the low arc)
const BACKHAND = [
  [1, { a1: 2.3, a2: -3.33 }], [2, { bob: 1.5, lean: 0.1, a1: 1.9, a2: -3.9, plates: 0.3 }], [3, { bob: 2, lean: 0.02, a1: 0.9, a2: -5.35, plates: 0.6, dx: 0 }],
  [4, { bob: 2.5, lean: 0, a1: 0.6, a2: -5.95, plates: 0.8, dx: 0 }], [5, { bob: 2.5, lean: 0, a1: 0.6, a2: -5.95, plates: 0.8, dx: 0 }],
  [6, { bob: 2.5, lean: 0.15, a1: 0.9, a2: -5.5, plates: 0.7, dx: 0 }], [7, { bob: 3, lean: 0.25, a1: 1.9, a2: -4.0, plates: 0.5, dx: -4 }],
  [8, { bob: 3, lean: 0.35, a1: 2.8, a2: -3.3, plates: 0.2, dx: -8, nfx: -23 }], [9, { bob: 3, lean: 0.35, a1: 2.9, a2: -3.15, plates: 0.2, dx: -8, nfx: -23 }],
  [10, { bob: 3, lean: 0.2, a1: 2.3, a2: -3.7, plates: 0.5, dx: -5 }], [11, { bob: 3, lean: 0, a1: 0.8, a2: -5.6, plates: 0.8, dx: 0 }],
  [12, { bob: 3, lean: 0.38, a1: 2.7, a2: -3.4, plates: 0.2, dx: -9, nfx: -23 }], [13, { bob: 3, lean: 0.38, a1: 2.9, a2: -3.2, plates: 0.2, dx: -9, nfx: -23 }],
  [14, { bob: 2.5, lean: 0.3, a1: 2.6, a2: -3.1, dx: -6 }], [15, { bob: 1, lean: 0.2, a1: 2.4, a2: -3.2, dx: -2 }], [16, { a1: 2.3, a2: -3.33 }]
];


// hand-placed landing fx (1 light, 2 mid, 3 dark): rock chips and dust kicked up by the cleaver, and the scrape of a backhand
const CHIPS1 = ['....3......1.....', '.2.....3...2..3..', '..1..22.1....2...', '.3..1111.2.3.....', '...211111.1...2..', '.2..3111122.3....', '..3..2211..2..1..', '....3..22...3....'];
const CHIPS2 = ['3.....2.....3....1..', '.....1...2.....3....', '..2.3....1..2....2..', '.....1.2....3.1.....', '..3.......2.........', '.1.....3......2..3..'];
const SLASH1 = ['........3.1', '.......21.1', '......21...', '.....211.3.', '....211....', '...21......', '..21.3.....', '.31........'];
const SLASH2 = ['.........3', '........2.', '.......1.3.', '......2....', '.....1..3..', '....2......'];

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
      cleaver: { keys: CLEAVER, who: () => 'tip', contacts: [10], windows: [[8, 10]], trail: ['#EEF1F8', '#9FA9C4', '#4E587A'], spark: ['#E8E0C8', '#8E96B4', '#3E4262'], stamps: [[CHIPS1, CHIPS2]], sparkDx: 0, sparkDy: -2, trailLen: 2 },
      backhand: { keys: BACKHAND, who: () => 'tip', contacts: [8, 12], windows: [[6, 9], [11, 13]], trail: ['#EEF1F8', '#9FA9C4', '#4E587A'], spark: ['#E8E0C8', '#8E96B4', '#3E4262'], stamps: [[SLASH1, SLASH2]], sparkDx: 0 }
    }
  });
}
