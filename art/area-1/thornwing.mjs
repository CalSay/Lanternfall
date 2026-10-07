// art/area-1/thornwing.mjs: the Thornwing (zone 4), drawn as parts. A fist-sized torso hung between two crescent thorn wings, long hooked
// feet and a bright face slit (docs/design/enemies-c22-hollow-final.md). Faces LEFT. It hovers: no shadow, origin = the ground point below it.
// Actions: idle, hop (a glide), hurt, stagger, death, needle (Wing Needle), scissor (Scissor Flight).
import { ell, cap, poly, chain, thorn, box, ramp } from './kit.mjs';
import { makeDef, BASE_TIMINGS } from './creature-common.mjs';

export const TW_CELL = [128, 112], TW_ORIGIN = [90, 104];
const M = {
  wing: ramp('#1C7C6C', { shade: 0.36, shadeTo: '#0A1E2E' }), wingD: ramp('#14585C', { shade: 0.34, shadeTo: '#08162A' }), body: ramp('#2C3E7A', { shade: 0.34, shadeTo: '#0E1230' }),
  bone: ramp('#E8E0BC', { light: 0.3 }), boneD: ramp('#B2A67E'), dark: ramp('#141A2E')
};
const SLIT = '#E4FF4A';
export const twPose0 = {
  bob: 0, dx: 0, dy: 0, tilt: 0.1,                  // tilt: body lean (rad, + leans head down toward the hero)
  wa: -1.15, wc: -1.5, wl: 1, fa: -0.55, fc: -1.35, fl: 0.9,   // near / far wing: base angle, curl, length scale
  lg: 0, lk: 0, mouth: 0
};

// a crescent: a centre line from (bx, by) that starts at angle a, bends by `curl` over its length L, and a width that swells then tapers to a point
function crescent(bx, by, a, L, curl, w, n = 16) {
  const out = [], inn = [], cl = []; let x = bx, y = by;
  for (let i = 0; i <= n; i++) {
    const u = i / n, ang = a + curl * u, wu = w * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.92 + 0.06)), 0.9) * (1 - u * 0.3);
    cl.push([x, y]); const nx = -Math.sin(ang), ny = Math.cos(ang);
    out.push([x - nx * wu * 1.0, y - ny * wu * 1.0]); inn.push([x + nx * wu * 0.15, y + ny * wu * 0.15]);
    x += Math.cos(ang) * L / n; y += Math.sin(ang) * L / n;
  }
  return { poly: out.concat(inn.reverse()).flat(), out, cl, tip: cl[n] };
}

export function drawThornwing(S, p, ox, oy) {
  p = Object.assign({}, twPose0, p);
  const X = x => ox + (p.dx || 0) + x, Y = y => oy + (p.dy || 0) + y;
  const add = (sd, mat, z, o) => S.add(sd, mat, z, o);
  const C = [0, -37 + p.bob], ct = Math.cos(p.tilt), st = Math.sin(p.tilt);
  const R = (x, y) => [C[0] + x * ct + y * st, C[1] - x * st + y * ct];    // body-local to cell-relative; tilt turns the head toward the hero
  // a crescent thorn wing: a bone-pale leading edge on the outer curve, a hooked thorn at the tip, a short barb on the inner curve
  const wing = (a, curl, L, w, mat, z, root, tipsOut, who) => {
    const r = R(...root), c = crescent(X(r[0]), Y(r[1]), a, L, curl, w), n = c.cl.length - 1;
    add(poly(c.poly), mat, z, { rim: 2.4, tex: 0.1 });
    add(chain(c.out.slice(1, -1).map(([x, y], i, A) => [x, y, 0.8 + 0.5 * Math.sin(Math.PI * (i + 1) / (A.length + 1))])), M.bone, z + 0.02, { rim: 1.2, nl: 1, noLine: 1, tex: 0 });
    const ang = Math.atan2(c.cl[n][1] - c.cl[n - 2][1], c.cl[n][0] - c.cl[n - 2][0]), hk = ang + (curl < 0 ? -0.9 : 0.9);
    add(thorn(c.tip[0], c.tip[1], c.tip[0] + Math.cos(hk) * 6, c.tip[1] + Math.sin(hk) * 6, 2.8, 0), M.bone, z + 0.03, { rim: 1.2, nl: 1, tex: 0 });   // the hooked tip
    const m = c.cl[Math.round(n * 0.55)], q = c.cl[Math.round(n * 0.55) + 1];
    const ba = Math.atan2(q[1] - m[1], q[0] - m[0]) + (curl < 0 ? 1.2 : -1.2);
    add(thorn(m[0], m[1], m[0] + Math.cos(ba) * 6, m[1] + Math.sin(ba) * 6, 3, 0), mat, z + 0.01, { rim: 1.4, tex: 0 });   // a barb on the inner edge
    tipsOut[who] = [c.tip[0] + Math.cos(hk) * 6, c.tip[1] + Math.sin(hk) * 6];
  };
  const tips = {};
  // far wing: sweeps up and back; near wing sweeps up and forward over the face. The torso hangs between them.
  const kn = Math.min(1, Math.abs(p.wc) / 1.4), kf = Math.min(1, Math.abs(p.fc) / 1.4);
  wing(p.fa - 0.6 * kf, -p.fc * 1.25, 36 * p.fl, 6.4, M.wingD, 1, [3, -3], tips, 'far');
  // hooked feet: two long legs trailing down, each ending in a bone hook that curls forward
  const foot = (rx, ry, lag, mat, z) => {
    const h = R(rx, ry), k = [h[0] + 3 + p.lg * 2 + lag, h[1] + 9], f = [k[0] + 1 + p.lg * 3 - lag * 0.3, k[1] + 9 + p.lk * 2];
    add(chain([[X(h[0]), Y(h[1]), 2.3], [X(k[0]), Y(k[1]), 1.7], [X(f[0]), Y(f[1]), 1.3]]), mat, z, { rim: 1.8, tex: 0 });
    add(chain([[X(f[0]), Y(f[1]), 1.3], [X(f[0] - 3), Y(f[1] + 3), 1.1], [X(f[0] - 7), Y(f[1] + 2), 0.9], [X(f[0] - 8.5), Y(f[1] - 1.5), 0.4]]), M.bone, z + 0.01, { rim: 1.2, nl: 1, tex: 0 });
    add(thorn(X(k[0]), Y(k[1]), X(k[0] + 4), Y(k[1] - 3), 2.4, 0), M.boneD, z - 0.01, { rim: 1.2, tex: 0 });
  };
  foot(3, 5, 2, M.body, 1.2);
  // a small torso: a dark fist of a body, a bone ridge down the back, a small ivory face plate with ONE bright slit
  for (let i = 0; i < 3; i++) { const a = R(4.6 - i * 0.5, -3 + i * 3.6), b = R(9 - i * 0.6, -6.5 + i * 4.2); add(thorn(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), 2.8, 0.6), M.boneD, 1.8, { rim: 1.4, tex: 0 }); }
  const t = R(0, 0); add(ell(X(t[0]), Y(t[1]), 5.8, 8, -p.tilt), M.body, 2, { rim: 4.4, tex: 0.1 });
  const g = R(-0.5, 6); add(ell(X(g[0]), Y(g[1]), 3.4, 3.4, 0), M.dark, 2.1, { rim: 2.2, tex: 0 });
  const f = R(-3.6, -3.4), jaw = Math.round(p.mouth);
  add(ell(X(f[0]), Y(f[1]), 3.7, 4.4, -p.tilt - 0.1), M.bone, 3, { rim: 3, tex: 0 });
  add(thorn(...[...R(-1, -6).map((v, i) => i ? Y(v) : X(v))], ...[...R(4, -12).map((v, i) => i ? Y(v) : X(v))], 2.8, -1), M.bone, 2.9, { rim: 1.4, tex: 0 });   // a crest swept back
  const e = R(-5.6, -3.4);
  add(box(X(e[0]), Y(e[1]), 5.6, 2.6 + jaw * 0.6, 0.1 - p.tilt), M.dark, 3.2, { flat: 1, nl: 1 });                // the face slit: dark socket with the one bright glow in it
  add(box(X(e[0] + 0.2), Y(e[1]), 4.4, 1.2 + (jaw ? 0.8 : 0), 0.1 - p.tilt), null, 3.3, { emit: SLIT });
  foot(-3, 6, 0, M.body, 4);
  wing(p.wa - 0.9 * kn, p.wc * 1.1, 40 * p.wl, 7.2, M.wing, 5, [-1, -6], tips, 'near');
  return tips;
}

// ---------- poses ----------
const IDLE = i => ({ bob: [0, -1.2, -2, -0.8][i], wa: -1.15 + [0, 0.18, 0.32, 0.12][i], fa: -0.55 + [0, 0.2, 0.34, 0.14][i], wc: -1.5 - [0, 0.1, 0.2, 0.1][i], fc: -1.35 - [0, 0.1, 0.18, 0.08][i], lg: [0, 0.4, 0.8, 0.4][i], tilt: 0.1 + [0, 0.03, 0.05, 0.02][i] });
const HOP = [   // gather, beat up, glide forward (wings spread and still), glide, flare, settle
  { bob: 1, wa: -0.6, wc: -1.3, fa: -0.1, fc: -1.2, lg: 0.3, tilt: 0.0 },
  { bob: -3, dy: -1, wa: -1.7, wc: -1.4, fa: -1.2, fc: -1.3, lg: 0.6, tilt: 0.15 },
  { bob: -4, dy: -5, wa: -0.4, wc: -0.9, fa: 0.05, fc: -0.9, lg: 1.2, tilt: 0.3 },
  { bob: -4, dy: -6, wa: -0.3, wc: -0.8, fa: 0.1, fc: -0.8, lg: 1.4, tilt: 0.3 },
  { bob: -3, dy: -3, wa: -1.2, wc: -1.5, fa: -0.7, fc: -1.4, lg: 0.9, tilt: 0.1 },
  { bob: 0, wa: -1.0, wc: -1.5, fa: -0.5, fc: -1.3, lg: 0.2, tilt: 0.08 }
];
const HURT = [
  { bob: 1, dx: 3, tilt: -0.3, wa: -1.8, wc: -1.1, fa: -1.3, fc: -1.0, lg: -1, mouth: 2 },
  { bob: 2, dx: 6, tilt: -0.5, wa: -2.1, wc: -0.8, fa: -1.6, fc: -0.8, lg: -2, mouth: 3 },
  { bob: 1, dx: 4, tilt: -0.3, wa: -1.6, wc: -1.2, fa: -1.1, fc: -1.1, lg: -1, mouth: 2 },
  { bob: 0, dx: 1, tilt: -0.05, wa: -1.2, wc: -1.4, fa: -0.7, fc: -1.3, lg: 0 }
];
const STAGGER = [
  { bob: 2, dx: 0, tilt: 0.35, wa: -0.3, wc: -1.0, fa: 0.2, fc: -0.9, lg: 1, mouth: 1 },
  { bob: 5, dy: 3, dx: -2, tilt: 0.55, wa: 0.1, wc: -0.8, fa: 0.5, fc: -0.7, lg: 2, mouth: 2 },
  { bob: 4, dy: 3, dx: -1, tilt: 0.45, wa: -0.1, wc: -0.9, fa: 0.3, fc: -0.8, lg: 1.5, mouth: 1 },
  { bob: 1, dy: 1, tilt: 0.2, wa: -0.9, wc: -1.3, fa: -0.4, fc: -1.2, lg: 0.5 }
];
const DEATH = [
  { bob: 1, dx: 3, tilt: -0.4, wa: -1.9, wc: -1.0, fa: -1.4, fc: -0.9, lg: -1, mouth: 3 },
  { bob: 4, dx: 5, dy: 5, tilt: -0.8, wa: -2.4, wc: -0.6, fa: -1.9, fc: -0.6, lg: -2, mouth: 3 },
  { bob: 6, dx: 6, dy: 14, tilt: -1.2, wa: -2.6, wc: -0.3, fa: -2.1, fc: -0.3, lg: -2, mouth: 3, wl: 0.9 },
  { bob: 7, dx: 6, dy: 24, tilt: -1.5, wa: -2.7, wc: 0.2, fa: -2.2, fc: 0.2, lg: -1, mouth: 2, wl: 0.8 }
];
// Wing Needle (14 frames): hover; the near wing straightens and points forward (hold, glinting); a short dive down-left; recover.
const NEEDLE = [
  [1, {}], [2, { bob: -2, tilt: 0.0, wa: -1.6, wc: -1.3, dx: 3 }], [3, { bob: -3, tilt: 0.1, wa: -2.6, wc: -0.8, dx: 4, lg: 0.5 }],
  [4, { bob: -2, tilt: 0.25, wa: -3.0, wc: -0.2, dx: 3, lg: 0.8 }], [5, { bob: -2, tilt: 0.3, wa: -3.1, wc: 0.0, dx: 3, lg: 1 }], [6, { bob: -2, tilt: 0.3, wa: -3.1, wc: 0.0, dx: 3, lg: 1 }],
  [7, { bob: -2, tilt: 0.32, wa: -3.1, wc: 0.0, dx: 4, lg: 1 }], [8, { bob: 0, dy: 3, dx: -4, tilt: 0.7, wa: -3.4, wc: 0.0, fa: -0.9, lg: 1.5 }],
  [9, { bob: 2, dy: 8, dx: -12, tilt: 0.85, wa: -3.5, wc: 0.0, fa: -0.9, fc: -1.0, lg: 2 }], [10, { bob: 2, dy: 9, dx: -14, tilt: 0.85, wa: -3.5, wc: 0.0, fa: -0.9, fc: -1.0, lg: 2 }],
  [11, { bob: 1, dy: 5, dx: -9, tilt: 0.5, wa: -3.0, wc: -0.4, lg: 1 }], [12, { bob: 0, dy: 2, dx: -4, tilt: 0.3, wa: -2.0, wc: -1.0, lg: 0.5 }],
  [13, { bob: -1, dy: 0, dx: -1, tilt: 0.15, wa: -1.3, wc: -1.4 }], [14, {}]
];
// Scissor Flight (14 frames): wings spread back; the wing edges sweep in and cross in front (hit 1); they spread apart (hit 2); settle.
const SCISSOR = [
  [1, {}], [2, { bob: -2, wa: -0.5, wc: -1.0, fa: 0.2, fc: -1.0, tilt: 0.0, dx: 3, lg: 0.5 }], [3, { bob: -3, wa: -0.1, wc: -0.9, fa: 0.6, fc: -0.9, tilt: -0.05, dx: 4, lg: 0.8 }],
  [4, { bob: -3, wa: 0.1, wc: -0.9, fa: 0.8, fc: -0.9, tilt: -0.05, dx: 5, lg: 1 }], [5, { bob: -3, wa: 0.1, wc: -0.9, fa: 0.8, fc: -0.9, tilt: -0.05, dx: 5, lg: 1 }],
  [6, { bob: -2, wa: -1.3, wc: -1.5, fa: -2.6, fc: 0.3, tilt: 0.3, dx: -2, lg: 1 }], [7, { bob: -1, wa: -2.6, wc: -0.6, fa: -3.3, fc: 0.3, tilt: 0.4, dx: -8 }],
  [8, { bob: -1, wa: -2.9, wc: -0.2, fa: -3.0, fc: 0.2, tilt: 0.4, dx: -9 }], [9, { bob: -1, wa: -3.0, wc: -0.2, fa: -2.9, fc: 0.2, tilt: 0.4, dx: -9 }],
  [10, { bob: -1, wa: -1.8, wc: -1.1, fa: -1.4, fc: -0.8, tilt: 0.25, dx: -8 }], [11, { bob: -1, wa: 0.0, wc: -1.1, fa: -3.9, fc: 0.9, tilt: 0.1, dx: -9 }],
  [12, { bob: -1, wa: 0.3, wc: -1.0, fa: -4.2, fc: 0.9, tilt: 0.1, dx: -8 }], [13, { bob: -1, wa: -0.6, wc: -1.3, fa: -1.8, fc: -1.0, tilt: 0.15, dx: -3 }], [14, { dx: -1 }]
];

// hand-placed landing fx (1 pale, 2 lime, 3 dark teal): a needle prick with flicked specks, and the crossed edge flash of the scissor
const PRICK1 = ['.....3...', '..3..1..2.', '.....1....', '3.2.1111.3', '.....1....', '..2..1..3.', '....3.....'];
const PRICK2 = ['3...2.....3', '...1....2..', '.2.....1...', '....3.....2', '.1....3....'];
const CROSS1 = ['2.......3.2', '.21.....12..', '..21...12.3.', '...2111.2...', '....111.....', '...21.12....', '..21...12.3.', '.2.......2..', '3.........3.'];
const CROSS2 = ['.3.......2.', '..2.....2..3', '.....1.1....', '......3.....', '.....1.1....', '..2.....2.3.', '3.........2.'];

export function thornwingDef() {
  const T = {
    ...BASE_TIMINGS,
    idle: { ...BASE_TIMINGS.idle, ms: [180, 160, 160, 180] },
    hop: { ...BASE_TIMINGS.hop, ms: [110, 70, 130, 110, 120, 140] },
    needle: { loop: 0, start: 2, end: 13, rel: [8], con: [9], ms: [500, 130, 160, 280, 340, 260, 100, 70, 60, 70, 110, 130, 110, 100], atk: true, hit: true },
    scissor: { loop: 0, start: 2, end: 13, rel: [6, 10], con: [7, 11], ms: [420, 130, 150, 160, 220, 70, 60, 120, 140, 70, 60, 110, 130, 110], atk: true, hit: true }
  };
  return makeDef({
    key: 'thornwing', cell: TW_CELL, origin: TW_ORIGIN, pose0: twPose0, draw: drawThornwing, timings: T, hopMove: [120, 400],
    idle: IDLE, hop: HOP, hurt: HURT, stagger: STAGGER, death: DEATH, liftPx: 4,
    moves: {
      needle: { keys: NEEDLE, who: () => 'near', contacts: [9], windows: [[7, 10]], trail: ['#F4FFC8', '#B8E84A', '#2C8A6A'], spark: ['#F4FFC8', '#B8E84A', '#2C6A5A'], stamps: [[PRICK1, PRICK2]], sparkDx: -2, trailLen: 2, trailMax: 40 },
      scissor: { keys: SCISSOR, who: k => (k + 1 >= 10 ? 'far' : 'near'), contacts: [7, 11], windows: [[6, 8], [10, 12]], trail: ['#F4FFC8', '#B8E84A', '#2C8A6A'], spark: ['#F4FFC8', '#B8E84A', '#2C6A5A'], stamps: [[CROSS1, CROSS2]], sparkDx: -2, trailMax: 40 }
    }
  });
}
