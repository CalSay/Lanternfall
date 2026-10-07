// art/area-1/imp-pack.mjs: the Thorn Imp's actions: idle, hop, hurt, stagger, death, Briar Jab, Crosscut. Same frame counts and timings as
// the approved Codex pack (codexTimings), so the turn-fight windows do not move.
import { Sprite, blankImg, sampleKeys, poly, cap, chain, ell, rgb, ramp } from './kit.mjs';
import { drawImp, IMP_CELL, IMP_ORIGIN, impPose0 } from './imp.mjs';
import { codexTimings } from './pack.mjs';

const FX_CELL = [176, 128], FX_ORIGIN = [132, 104];
const key = (list, i) => sampleKeys(list, i + 1, impPose0);   // keys are by one-based frame number
const render = p => { const S = new Sprite(...IMP_CELL); const t = drawImp(S, p, ...IMP_ORIGIN); const img = S.render(); img.tips = t; return img; };

// dissolve: remove pixels by a fixed random threshold as `u` goes 0..1, lifting what is left (the body unravels, it does not bleed)
function dissolve(img, u, seed = 3) {
  const o = blankImg(img.w, img.h);
  const lift = Math.round(u * 6);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    const i = (y * img.w + x) * 4; if (!img.d[i + 3]) continue;
    const h = (((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0) % 1000 / 1000, hy = y - lift;
    if (h < u * 1.15 - (y / img.h) * 0.25 || hy < 0) continue;
    const j = (hy * img.w + x) * 4; o.d[j] = img.d[i]; o.d[j + 1] = img.d[i + 1]; o.d[j + 2] = img.d[i + 2]; o.d[j + 3] = 255;
  }
  return o;
}

const IDLE = i => ({ bob: [0, 0.8, 1.4, 0.6][i], lean: 0.18 + [0, 0.02, 0.04, 0.02][i], na1: 2.55 + [0, 0.05, 0.1, 0.05][i], na2: 2.0 + [0, 0.05, 0.1, 0.05][i], fa1: 2.7 + [0.04, 0, -0.04, 0][i], tail: [0, 0.5, 1, 0.5][i], hornSw: [0, 0.3, 0.6, 0.3][i] });
const HOP = [   // crouch, push, rise, peak, fall, land
  { bob: 4, lean: 0.35, na1: 2.2, na2: 1.7, fa1: 2.3, fa2: 2.0, nfx: -18, ffx: -4, tail: 1 },
  { bob: 1, lean: 0.4, dy: -3, nfl: 2, ffl: 2, na1: 2.9, na2: 2.5, fa1: 3.0, fa2: 2.7, tail: 0.5 },
  { bob: 0, lean: 0.35, dy: -9, nfl: 7, ffl: 7, nfx: -20, ffx: -8, na1: 3.1, na2: 3.0, fa1: 3.15, fa2: 3.1, tail: -0.5 },
  { bob: 0, lean: 0.25, dy: -12, nfl: 8, ffl: 8, nfx: -20, ffx: -8, na1: 3.0, na2: 3.1, fa1: 3.1, fa2: 3.2, tail: -0.8 },
  { bob: 0, lean: 0.25, dy: -6, nfl: 5, ffl: 5, nfx: -20, ffx: -7, na1: 2.8, na2: 2.8, fa1: 2.9, fa2: 2.9, tail: -0.2 },
  { bob: 5, lean: 0.3, na1: 2.3, na2: 1.8, fa1: 2.4, fa2: 2.0, tail: 0.8 }
];
const HURT = [
  { bob: 1, lean: -0.1, tilt: -0.25, na1: 2.0, na2: 1.3, fa1: 2.2, fa2: 1.6, jaw: 2, dx: 2 },
  { bob: 2, lean: -0.22, tilt: -0.4, na1: 1.5, na2: 1.0, fa1: 1.8, fa2: 1.4, jaw: 3, dx: 4, tail: 1 },
  { bob: 2, lean: -0.12, tilt: -0.25, na1: 1.9, na2: 1.4, fa1: 2.1, fa2: 1.7, jaw: 2, dx: 3 },
  { bob: 1, lean: 0.1, tilt: -0.1, na1: 2.4, na2: 1.9, fa1: 2.6, fa2: 2.2, dx: 1 }
];
const STAGGER = [
  { bob: 5, lean: 0.4, tilt: 0.1, na1: 2.0, na2: 1.4, fa1: 2.2, fa2: 1.8, nfx: -15, jaw: 1 },
  { bob: 7, lean: 0.5, tilt: 0.2, na1: 1.8, na2: 1.2, fa1: 2.0, fa2: 1.6, nfx: -15, ffx: -2, jaw: 2, dx: -2 },
  { bob: 6, lean: 0.35, tilt: 0.05, na1: 2.1, na2: 1.6, fa1: 2.3, fa2: 1.9, jaw: 1 },
  { bob: 3, lean: 0.25, na1: 2.4, na2: 1.9, fa1: 2.6, fa2: 2.2 }
];
const DEATH = [
  { bob: 2, lean: -0.15, tilt: -0.3, na1: 1.4, na2: 0.9, fa1: 1.7, fa2: 1.2, jaw: 3, dx: 4 },
  { bob: 6, lean: -0.35, tilt: -0.5, na1: 0.9, na2: 0.3, fa1: 1.3, fa2: 0.8, jaw: 3, dx: 8, nfx: -14, ffx: -1, nfl: 0, tail: 1 },
  { bob: 12, lean: -0.6, tilt: -0.6, na1: 0.6, na2: 0.0, fa1: 1.0, fa2: 0.4, jaw: 3, dx: 12, nfx: -12, ffx: 1 },
  { bob: 16, lean: -0.9, tilt: -0.7, na1: 0.3, na2: -0.3, fa1: 0.7, fa2: 0.1, jaw: 2, dx: 15, nfx: -12, ffx: 2, tail: 0.5 }
];

export function impDef() {
  const T = codexTimings('imp'), A = T.acts;
  const acts = {
    idle: { ...A.idle, frame: i => ({ body: render(IDLE(i)) }) },
    hop: { ...A.hop, frame: i => ({ body: render(HOP[i]) }) },
    hurt: { ...A.hurt, frame: i => ({ body: render(HURT[i]) }) },
    stagger: { ...A.stagger, frame: i => ({ body: render(STAGGER[i]) }) },
    death: { ...A.death, frame: (i, n) => {
      if (i === n - 1) return { body: blankImg(...IMP_CELL) };
      const k = Math.min(i, 3), img = render(DEATH[k]);
      return { body: i < 4 ? img : dissolve(img, (i - 3) / 5.4) };
    } }
  };
  const JAB = [
    [1, { bob: 1 }], [2, { na1: 1.2, na2: 2.5, lean: 0.12, bob: 1.5 }], [4, { na1: 0.3, na2: 3.0, lean: -0.02, bob: 2.5, tilt: -0.08 }],
    [6, { na1: 0.25, na2: 3.05, lean: -0.05, bob: 3, tilt: -0.1 }], [7, { na1: 1.6, na2: 3.1, lean: 0.3, bob: 2, dx: -3 }], [8, { na1: 2.5, na2: 3.2, lean: 0.45, bob: 2, dx: -7 }],
    [9, { na1: 2.9, na2: 3.25, lean: 0.52, bob: 2.5, dx: -10, nfx: -22 }], [10, { na1: 2.9, na2: 3.25, lean: 0.5, bob: 2.5, dx: -10, nfx: -22 }],
    [11, { na1: 2.6, na2: 2.7, lean: 0.35, bob: 1.5, dx: -5 }], [12, { na1: 2.55, na2: 2.0, lean: 0.2, bob: 0.5, dx: -1 }]
  ];
  const CROSS = [
    [1, { bob: 1 }], [2, { na1: 1.3, na2: 0.4, fa1: 2.4, fa2: 3.5, bob: 2, lean: 0.12 }], [4, { na1: 0.9, na2: -0.6, fa1: 2.3, fa2: 3.9, bob: 3, lean: 0.08 }],
    [6, { na1: 0.8, na2: -0.7, fa1: 2.25, fa2: 3.95, bob: 3.5, lean: 0.05 }], [7, { na1: 1.7, na2: 1.0, fa1: 2.25, fa2: 3.95, bob: 3, lean: 0.25, dx: -3 }],
    [8, { na1: 2.8, na2: 3.0, fa1: 2.3, fa2: 3.9, bob: 2.5, lean: 0.4, dx: -7 }], [9, { na1: 2.8, na2: 3.0, fa1: 2.3, fa2: 3.9, bob: 2.5, lean: 0.4, dx: -7 }],
    [10, { na1: 2.5, na2: 2.4, fa1: 1.7, fa2: 4.3, bob: 3, lean: 0.25, dx: -5 }], [12, { na1: 2.4, na2: 2.2, fa1: 1.9, fa2: 4.0, bob: 3, lean: 0.3, dx: -5 }],
    [13, { na1: 2.4, na2: 2.2, fa1: 2.9, fa2: 3.2, bob: 2.5, lean: 0.5, dx: -11, nfx: -22 }], [14, { na1: 2.4, na2: 2.2, fa1: 2.9, fa2: 3.2, bob: 2.5, lean: 0.5, dx: -11, nfx: -22 }],
    [15, { na1: 2.5, na2: 2.0, fa1: 2.75, fa2: 2.6, bob: 1.5, lean: 0.3, dx: -5 }], [16, { bob: 0.5, dx: -1 }]
  ];
  // the trail and the landed-hit spark (fx cell, drawn at the world root, which sits at the body's origin)
  const fxFor = (keys, n, who, contacts, windows) => i => {
    const j = i + 1, c = contacts.find(c => j >= c[0] - 2 && j <= c[0] + 2 && j >= c[0] - 1 || j === c[0] + 1);
    const atk = blankImg(...FX_CELL), hit = blankImg(...FX_CELL);
    const tipAt = k => { const S = new Sprite(...IMP_CELL); return drawImp(S, key(keys, k), ...IMP_ORIGIN)[who(k)]; };
    const hot = windows.find(w => j >= w[0] && j <= w[1]);
    if (hot) {
      const S = new Sprite(...FX_CELL, { noOutline: true });
      const pts = []; for (let k = Math.max(0, i - 3); k <= i; k++) pts.push(tipAt(k));
      const tr = pts.map((p, q) => [FX_ORIGIN[0] + p[0] - IMP_ORIGIN[0], FX_ORIGIN[1] + p[1] - IMP_ORIGIN[1], 0.6 + q * 0.9]);
      if (tr.length > 1) S.add(chain(tr), null, 1, { emit: '#EAD7FF' });
      S.add(chain(tr.map(([x, y, r], q) => [x, y, Math.max(0.3, r - 1.2)])), null, 2, { emit: '#FFFFFF' });
      Object.assign(atk, S.render());
    }
    if (c && j >= c[0] && j <= c[0] + 2) {
      const t = tipAt(c[0] - 1), cx = FX_ORIGIN[0] + t[0] - IMP_ORIGIN[0] - 4, cy = FX_ORIGIN[1] + t[1] - IMP_ORIGIN[1], r = [5, 8, 6][j - c[0]], S = new Sprite(...FX_CELL, { noOutline: true });
      const star = rr => { const pts = []; for (let q = 0; q < 12; q++) { const a = q / 12 * Math.PI * 2, d = q % 2 ? rr * 0.4 : rr; pts.push(cx + Math.cos(a) * d, cy + Math.sin(a) * d); } return poly(pts); };
      S.add(star(r), null, 1, { emit: '#FF9A5A' }); S.add(star(r * 0.55), null, 2, { emit: '#FFF3B8' });
      Object.assign(hit, S.render());
    }
    return { atk, hit };
  };
  const mk = (id, keys, who, contacts, windows) => {
    const n = A[id].ms.length, fx = fxFor(keys, n, who, contacts, windows);
    acts[id] = { ...A[id], atk: true, hit: true, frame: i => { const f = fx(i); return { body: render(key(keys, i)), atk: f.atk, hit: f.hit }; } };
  };
  mk('jab', JAB, () => 'near', [[9]], [[7, 11]]);
  mk('crosscut', CROSS, k => (k + 1 >= 12 ? 'far' : 'near'), [[8], [13]], [[7, 9], [12, 15]]);
  return { key: 'imp', cell: IMP_CELL, origin: IMP_ORIGIN, fxCell: FX_CELL, fxOrigin: FX_ORIGIN, hopMove: T.hopMove, mouth: null, acts, fx: {} };
}
