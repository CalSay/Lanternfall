// art/area-1/gloomjaw.mjs: Gloomjaw (zone 2): a bipedal maw with three interlocking petal jaws and a hollow violet throat.
// Faces LEFT. Origin = between its feet. Same frame counts and timings as the approved Codex pack.
import { Sprite, ell, cap, poly, uni, sub, inter, chain, box, ramp, blankImg, sampleKeys, thorn, hash } from './kit.mjs';
import { ik, limb, rotPt } from './rig.mjs';
import { codexTimings } from './pack.mjs';

export const GJ_CELL = [128, 128], GJ_ORIGIN = [64, 112];
const M = { skin: ramp('#3F7036', { shade: 0.36, light: 0.3 }), skinD: ramp('#27402A'), petal: ramp('#C9BF8A', { light: 0.3 }), petalD: ramp('#8E8760'), throat: ramp('#4A1F66', { shade: 0.4 }), tooth: ramp('#EFE6C8'), moss: ramp('#8AB040') };
const P0 = { bob: 0, lean: 0.1, open: 0.15, charge: 0, dx: 0, dy: 0, lfx: -9, rfx: 8, lfl: 0, rfl: 0, sway: 0 };
const key = (keys, i) => sampleKeys(keys, i + 1, P0);

// a petal jaw: hinge, direction angle (PI = left), length, width; returns its tip
function petal(S, hx, hy, ang, L, W, mat, z, teethSide) {
  const loc = [[0, -W * 0.45], [L * 0.3, -W * 0.62], [L * 0.7, -W * 0.38], [L, 0], [L * 0.7, W * 0.38], [L * 0.3, W * 0.62], [0, W * 0.45]];
  const pts = []; for (const [x, y] of loc) { const [rx, ry] = rotPt(x, y, ang); pts.push(hx + rx, hy + ry); }
  S.add(poly(pts), mat, z, { rim: 3.2, hi: 1 });
  if (teethSide) for (let k = 0; k < 4; k++) {   // fangs along the inner edge
    const s = 0.32 + k * 0.15, [bx, by] = rotPt(L * s, teethSide * W * 0.3 * (1 - s * 0.6), ang), [tx, ty] = rotPt(L * s + 2.2, teethSide * (W * 0.3 * (1 - s * 0.6) + 5.2 - k * 0.5), ang);
    const [ax, ay] = rotPt(L * s + 3.2, teethSide * W * 0.3 * (1 - s * 0.6), ang);
    S.add(poly([hx + bx, hy + by, hx + ax, hy + ay, hx + tx, hy + ty]), M.tooth, z + 0.1, { flat: 1, nl: 1 });
  }
  const [tx, ty] = rotPt(L, 0, ang); return [hx + tx, hy + ty];
}

export function drawGloomjaw(S, p, ox, oy) {
  p = Object.assign({}, P0, p);
  const X = x => ox + p.dx + x, Y = y => oy + p.dy + y, add = (sd, mat, z, o) => S.add(sd, mat, z, o);
  const bodyC = [2 + p.sway, -40 + p.bob], mouth = [-14 + p.sway - p.lean * 6, -48 + p.bob];
  // legs: stubby, knees forward, clawed toes
  const leg = (hx, hy, fx, lift, mat, z) => {
    const ank = [fx + 1, -5 - lift], [kx, ky] = ik(hx, hy, ank[0], ank[1], 11, 10, 1);
    add(limb([X(hx), Y(hy)], [X(kx), Y(ky)], [X(ank[0]), Y(ank[1])], 5, 3.6, 2.4), mat, z, { rim: 3.5 });
    add(cap(X(ank[0]), Y(ank[1]), 2.3, X(fx - 6), Y(-1.5 - lift * 0.5), 2), mat, z, { rim: 2 });
    for (const d of [-9, -6]) add(cap(X(fx - 5), Y(-1.5 - lift * 0.5), 0.9, X(fx + d - 1), Y(0.5 - lift * 0.5), 0.3), M.tooth, z, { flat: 1, nl: 1 });
  };
  leg(bodyC[0] + 6, bodyC[1] + 16, p.rfx, p.rfl, M.skinD, 1);
  // body: a heavy bulb, its top ridged with petal-like back plates
  for (let k = 0; k < 3; k++) add(poly([X(bodyC[0] + 6 + k * 5), Y(bodyC[1] - 14 + k * 4), X(bodyC[0] + 10 + k * 5), Y(bodyC[1] - 24 + k * 4), X(bodyC[0] + 14 + k * 5), Y(bodyC[1] - 12 + k * 4)]), M.petalD, 1.5, { rim: 2 });
  add(ell(X(bodyC[0]), Y(bodyC[1]), 17, 21.5, -p.lean * 0.6), M.skin, 2, { rim: 6, tex: 0.5 });
  for (let k = 0; k < 3; k++) add(cap(X(bodyC[0] - 4 + k * 3), Y(bodyC[1] - 8 + k * 9), 0.7, X(bodyC[0] + 14), Y(bodyC[1] - 4 + k * 9), 0.7), M.skinD, 2.2, { flat: 1, nl: 1 });   // belly ribs
  add(ell(X(bodyC[0] + 8), Y(bodyC[1] - 8), 5, 3, 0.6), M.moss, 2.1, { rim: 2, tex: 0.9 });
  add(ell(X(bodyC[0] - 6), Y(bodyC[1] + 12), 4, 2.4, -0.3), M.moss, 2.1, { rim: 2, tex: 0.9 });
  // the throat: a hollow violet pit ringed by the jaws
  add(ell(X(mouth[0]), Y(mouth[1]), 8.6, 12.5, 0.08), M.throat, 3, { rim: 4 });
  add(ell(X(mouth[0] - 1), Y(mouth[1]), 4 + p.charge * 2, 6.5 + p.charge * 2), null, 3.2, { emit: p.charge > 0.5 ? '#9A5CFF' : '#6B38B8' });
  if (p.charge > 0.2) add(ell(X(mouth[0] - 1), Y(mouth[1]), 2 + p.charge * 2, 3.5 + p.charge * 2.5), null, 3.3, { emit: p.charge > 0.8 ? '#F2E6FF' : '#C8A0FF' });
  // three petals: far (behind, darker), top, bottom
  const o = p.open, hx = mouth[0] + 2, hy = mouth[1];
  petal(S, X(hx + 1), Y(hy - 2), Math.PI + 0.08 - o * 0.25 + 0.04, 19, 12, M.petalD, 3.05, 0);
  petal(S, X(hx), Y(hy - 9), Math.PI + 0.55 + o * 0.85, 27, 13.5, M.petal, 3.6, 1);
  petal(S, X(hx), Y(hy + 9), Math.PI - 0.55 - o * 0.85, 27, 13.5, M.petal, 3.7, -1);
  leg(bodyC[0] - 5, bodyC[1] + 17, p.lfx, p.lfl, M.skin, 4);
}

const IDLE = i => ({ bob: [0, 0.6, 1.2, 1.4, 0.8, 0.2][i], open: [0.12, 0.15, 0.2, 0.22, 0.17, 0.13][i], charge: 0.25, sway: [0, 0.3, 0.6, 0.6, 0.3, 0][i] });
const HOP = [{ bob: 5, lean: 0.25 }, { bob: 2, dy: -3, lean: 0.3, lfl: 2, rfl: 2, open: 0.3 }, { dy: -10, lfl: 7, rfl: 7, lfx: -10, rfx: 3, open: 0.5 }, { dy: -14, lfl: 8, rfl: 8, lfx: -10, rfx: 3, open: 0.55 }, { dy: -13, lfl: 8, rfl: 8, lfx: -10, rfx: 3, open: 0.5 }, { dy: -7, lfl: 5, rfl: 5, open: 0.35 }, { dy: -2, lfl: 1, rfl: 1, open: 0.2 }, { bob: 5, lean: 0.25, open: 0.1 }];
const HURT = [{ lean: -0.12, bob: 2, open: 0.6, dx: 2 }, { lean: -0.25, bob: 3, open: 0.7, dx: 4 }, { lean: -0.15, bob: 2, open: 0.5, dx: 3 }, { lean: 0, bob: 1, open: 0.25, dx: 1 }];
const STAG = [{ bob: 4, lean: 0.3, open: 0.5 }, { bob: 6, lean: 0.4, open: 0.7, dx: -2 }, { bob: 5, lean: 0.25, open: 0.55, sway: 2 }, { bob: 6, lean: 0.35, open: 0.7, sway: -2 }, { bob: 4, lean: 0.2, open: 0.4 }, { bob: 2, lean: 0.15, open: 0.25 }];
const DEATH = [{ lean: -0.1, bob: 3, open: 0.8, dx: 3 }, { lean: -0.25, bob: 6, open: 1, dx: 6, charge: 0.8 }, { lean: -0.45, bob: 11, open: 1, dx: 9, lfx: -6, rfx: 8 }, { lean: -0.7, bob: 17, open: 0.9, dx: 13, lfx: -4, rfx: 9, charge: 0.4 }];
const SNAP = [[1, {}], [2, { open: 0.35, lean: 0.05 }], [5, { open: 1.0, lean: -0.12, bob: 1 }], [9, { open: 1.35, lean: -0.22, bob: 2 }], [10, { open: 1.4, lean: -0.24, bob: 2.5 }], [11, { open: 1.2, lean: -0.1, dx: -4 }],
  [12, { open: -0.35, lean: 0.4, dx: -13, bob: 4 }], [13, { open: -0.1, lean: 0.3, dx: -11, bob: 3 }], [14, { open: 0.15, lean: 0.2, dx: -6 }], [16, { open: 0.12, lean: 0.1, dx: 0 }]];
const BOLT = [[1, {}], [2, { open: 0.4, charge: 0.2, lean: 0 }], [6, { open: 0.7, charge: 0.55, lean: -0.1, bob: 1 }], [10, { open: 0.85, charge: 1, lean: -0.18, bob: 2 }], [11, { open: 0.9, charge: 1, lean: -0.2, bob: 2.5 }],
  [12, { open: 1.0, charge: 0.4, lean: 0.12, dx: 3, bob: 1 }], [13, { open: 0.8, charge: 0.1, lean: 0.1, dx: 2 }], [14, { open: 0.5, charge: 0.1, lean: 0.1 }], [16, { open: 0.12, charge: 0.25 }]];

const render = p => { const S = new Sprite(...GJ_CELL); drawGloomjaw(S, p, ...GJ_ORIGIN); return S.render(); };
function dissolve(img, u) {
  const o = blankImg(img.w, img.h), lift = Math.round(u * 6);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { const i = (y * img.w + x) * 4; if (!img.d[i + 3]) continue;
    const h = (((x * 73856093) ^ (y * 19349663) ^ 5) >>> 0) % 1000 / 1000, hy = y - lift; if (h < u * 1.15 - (y / img.h) * 0.25 || hy < 0) continue;
    const j = (hy * img.w + x) * 4; o.d[j] = img.d[i]; o.d[j + 1] = img.d[i + 1]; o.d[j + 2] = img.d[i + 2]; o.d[j + 3] = 255; }
  return o;
}

// ---- effects (128 x 128, centre (64, 64)): shaded like the body (3 tones, a dark rim), irregular, hand-placed ----
const V = { vio: ramp('#7A44D8', { shade: 0.4, light: 0.35 }), core: ramp('#F2E6FF', { shade: 0.25 }), fang: ramp('#EFE6C8') };
const fxS = () => new Sprite(128, 128);
const shard = (cx, cy, a, l, w) => thorn(cx, cy, cx + Math.cos(a) * l, cy + Math.sin(a) * l, w, 0.8);
const burst = (S, cx, cy, r, mat, z, n = 9, seed = 1) => { for (let q = 0; q < n; q++) { const a = q / n * Math.PI * 2 + hash(q, seed) * 0.5, l = r * (0.55 + hash(q, seed + 9) * 0.6); S.add(shard(cx, cy, a, l, 3.4), mat, z, { rim: 1.6 }); } };
const biteFx = i => { const S = fxS(), c = Math.max(0, 19 - i * 4);   // two jaw plates with fangs close on the hero
  for (const sg of [-1, 1]) { const y = 64 + sg * (c + 5), pts = [];
    for (let k = -4; k <= 4; k++) pts.push(64 + k * 6, y + sg * (Math.abs(k) * 0.8));
    S.add(ell(64, y + sg * 6, 29, 9.5), M.petal, 1, { rim: 3.5 }); S.add(ell(64, y + sg * 12, 24, 5), M.petalD, 0.5, { rim: 2 });
    for (let k = -3; k <= 3; k++) { const x = 64 + k * 7 + (k % 2); S.add(poly([x - 2.5, y - sg * 4, x + 2.5, y - sg * 4, x + (k % 2) * 0.6, y - sg * (4 + 5 + hash(k, 4) * 2.5)]), V.fang, 2, { flat: 1, nl: 1 }); } }
  if (i >= 3) { burst(S, 64, 64, 9 + (i - 3) * 5, V.vio, 3, 8, i); S.add(ell(64, 64, 3 + (i - 3), 3 + (i - 3)), V.core, 4, { flat: 1 }); }
  return S.render(); };
const voidFx = i => { const S = fxS(), r = 24 - i * 3.8;   // violet motes streaming into the throat
  for (let q = 0; q < 7; q++) { const a = q / 7 * Math.PI * 2 + i * 0.5 + hash(q, 2), rr = r * (0.75 + hash(q, 3) * 0.5); S.add(ell(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr, 2.6, 2, a), V.vio, 1, { rim: 1.6 }); }
  S.add(ell(64, 64, 3 + i * 1.3, 3.5 + i * 1.3), V.vio, 2, { rim: 2.5 }); S.add(ell(63, 63, 1.5 + i * 0.6, 1.6 + i * 0.7), V.core, 3, { flat: 1 }); return S.render(); };
const projFx = i => { const S = fxS(), j = [0, 1, 0, -1][i];   // a void bead with a dark rim and a ragged violet tail
  S.add(chain([[44 - i * 2, 64 - j * 2, 1], [52, 64 + j, 3.5], [60, 64 + j, 6]]), V.vio, 1, { rim: 2 });
  S.add(ell(63, 64 + j, 8, 6.4), V.vio, 2, { rim: 4 }); S.add(ell(64, 64 + j, 4.4, 3.6), M.throat, 3, { rim: 2 }); S.add(ell(67, 62.5 + j, 1.6, 1.4), V.core, 4, { flat: 1 }); return S.render(); };
const impactFx = i => { const S = fxS(), r = 6 + i * 4.5;
  if (i < 5) burst(S, 64, 64, r, i < 2 ? V.core : V.vio, 1, 10, 3 + i % 2);
  if (i >= 2) for (let q = 0; q < 6; q++) { const a = q * 1.05 + 0.3, d = r * 0.8 + hash(q, 7) * 6; S.add(ell(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, 1.6, 1.6), V.vio, 0, { rim: 1.2 }); }
  return S.render(); };

export function gloomjawDef() {
  const T = codexTimings('gloomjaw'), A = T.acts;
  const acts = {
    idle: { ...A.idle, frame: i => ({ body: render(IDLE(i)) }) },
    hop: { ...A.hop, frame: i => ({ body: render(HOP[i]) }) },
    hurt: { ...A.hurt, frame: i => ({ body: render(HURT[i]) }) },
    stagger: { ...A.stagger, frame: i => ({ body: render(STAG[i]) }) },
    'snap-shut': { ...A['snap-shut'], frame: i => ({ body: render(key(SNAP, i)) }) },
    'void-bolt': { ...A['void-bolt'], frame: i => ({ body: render(key(BOLT, i)) }) },
    death: { ...A.death, frame: (i, n) => i === n - 1 ? { body: blankImg(...GJ_CELL) } : { body: i < 4 ? render(DEATH[i]) : dissolve(render(DEATH[3]), (i - 3) / 7) } }
  };
  const fx = { 'bite-fx': { ...T.fx['bite-fx'], frame: biteFx }, 'void-fx': { ...T.fx['void-fx'], frame: voidFx }, projectile: { ...T.fx.projectile, frame: projFx }, impact: { ...T.fx.impact, frame: impactFx } };
  return { key: 'gloomjaw', cell: GJ_CELL, origin: GJ_ORIGIN, fxCell: T.fxCell, fxOrigin: T.fxOrigin, hopMove: T.hopMove, mouth: T.mouth, acts, fx };
}
