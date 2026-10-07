// art/area-1/imp.mjs: the Thorn Imp (zone 1), drawn as parts. A split-mask fiend with a hooked horn and oversized thorn blades
// growing from both forearms (docs/design/enemies-c22-hollow-final.md). Faces LEFT, toward the hero. Origin = the grounded rear foot.
import { Sprite, ell, cap, poly, uni, sub, inter, chain, thorn, box, ramp, rgb } from './kit.mjs';
import { ik, limb, polar } from './rig.mjs';

export const IMP_CELL = [128, 96], IMP_ORIGIN = [100, 88];
const M = {
  skin: ramp('#4C3A52', { shade: 0.34, light: 0.3 }), skinD: ramp('#2E2437', { shade: 0.3 }), bone: ramp('#EFE6C6', { light: 0.25, shade: 0.4 }), boneD: ramp('#B6A98A'),
  violet: ramp('#6E3C8C', { shade: 0.3 }), moss: ramp('#6A8238'), dark: ramp('#2A1F2E')
};
export const impPose0 = {
  bob: 0, lean: 0.18, tilt: 0, jaw: 0, hornSw: 0,
  na1: 2.55, na2: 2.0, fa1: 2.7, fa2: 2.3,          // arm angles (rad; 0 = right, PI = left toward the hero, PI/2 = down)
  nfx: -17, nfy: 0, ffx: -3, ffy: 0, nfl: 0, ffl: 0,  // foot targets (relative to the origin) and lifts
  tail: 0, flash: 0, alpha: 1
};

export function drawImp(S, p, ox, oy) {
  p = Object.assign({}, impPose0, p);
  const dx0 = p.dx || 0, dy0 = p.dy || 0;
  const X = x => ox + dx0 + x, Y = y => oy + dy0 + y;
  const hip = [-8, -23 + p.bob], sh = [hip[0] + Math.sin(-p.lean) * 15 - 1, hip[1] - Math.cos(p.lean) * 15];
  const hd = [sh[0] + Math.sin(-p.lean * 1.3 - p.tilt) * 9 - 3, sh[1] - Math.cos(p.lean * 1.3 + p.tilt) * 9 - 1];
  const T = (x, y) => [X(x), Y(y)];
  const add = (sd, mat, z, o) => S.add(sd, mat, z, o);
  // ---- tail: a thin thorn curling out behind (right) ----
  const tw = p.tail;
  const t0 = T(hip[0] + 4, hip[1] + 3), t1 = T(hip[0] + 14, hip[1] + 6 + tw * 2), t2 = T(hip[0] + 22, hip[1] - 2 - tw * 5), t3 = T(hip[0] + 26, hip[1] - 11 - tw * 7);
  add(chain([[t0[0], t0[1], 2.6], [t1[0], t1[1], 1.9], [t2[0], t2[1], 1.3], [t3[0], t3[1], 0.5]]), M.skinD, 1, { rim: 2 });
  // ---- legs (IK, knees forward) ----
  const leg = (hx, hy, fx, fy, lift, mat, z) => {
    const ank = [fx + 2, fy - 5 - lift], [kx, ky] = ik(hx, hy, ank[0], ank[1], 12, 11, 1);
    add(limb(T(hx, hy), T(kx, ky), T(ank[0], ank[1]), 5.2, 3.6, 2.4), mat, z, { rim: 3.5 });
    add(cap(X(ank[0]), Y(ank[1]), 2.2, X(fx - 5), Y(fy - 1.5 - lift * 0.4), 2.0), mat, z, { rim: 2 });
    for (const dx of [-8, -5]) add(thorn(X(fx - 4), Y(fy - 1.4 - lift * 0.4), X(fx + dx - 1), Y(fy + 0.3 - lift * 0.4), 2.2, 0), M.bone, z, { rim: 1.5, flat: 0 });
  };
  leg(hip[0] + 5, hip[1] + 1, p.ffx, p.ffy, p.ffl, M.skinD, 1);
  // ---- far arm and blade ----
  const arm = (shx, shy, a1, a2, l1, l2, mat, bmat, z, big) => {
    const e = polar(shx, shy, a1, l1), h = polar(e[0], e[1], a2, l2);
    add(limb(T(shx, shy), T(e[0], e[1]), T(h[0], h[1]), 3.6, 3.0, 2.5), mat, z, { rim: 2.5 });
    const b0 = polar(e[0], e[1], a2, l2 * 0.2), b1 = polar(h[0], h[1], a2, big ? 20 : 17);
    add(thorn(...T(b0[0], b0[1]), ...T(b1[0], b1[1]), big ? 6.4 : 5.6, big ? -1.6 : -1.2), bmat, z + 0.05, { rim: 2.4, hi: 1 });
    const s0 = polar(e[0], e[1], a2 + 0.2, 2), s1 = polar(e[0], e[1], a2 - 1.0, 7);
    add(thorn(...T(s0[0], s0[1]), ...T(s1[0], s1[1]), 2.6, 0), bmat, z - 0.02, { rim: 1.5 });
    return polar(h[0], h[1], a2, big ? 20 : 17);
  };
  const farTip = arm(sh[0] + 5, sh[1] + 3, p.fa1, p.fa2, 10, 9, M.skinD, M.bone, 0.5, 1);
  // ---- body ----
  const mid = [(hip[0] + sh[0]) / 2, (hip[1] + sh[1]) / 2];
  const spine = [];
  for (let i = 0; i < 4; i++) { const u = i / 3, bx = hip[0] + (sh[0] - hip[0]) * u + 6.5 - u * 1.5, by = hip[1] + (sh[1] - hip[1]) * u - 3;
    add(thorn(...T(bx, by), ...T(bx + 5.5 - u, by - 4 - u * 2), 3.2 - u * 0.4, 0.8), M.boneD, 1.5, { rim: 1.5 }); }
  add(ell(X(mid[0]), Y(mid[1] + 1), 9.2, 12.4, -p.lean), M.skin, 2, { rim: 5, tex: 0.5 });
  add(ell(X(mid[0] - 3.2), Y(mid[1] + 3.5), 4.8, 8.4, -p.lean), M.moss, 2.1, { rim: 3, tex: 0.7, nl: 0 });   // a pale moss belly
  add(box(X(hip[0] - 1), Y(hip[1] + 2), 13, 4, -p.lean * 0.5, 1.5), M.dark, 2.2, { rim: 2, nl: 1 });          // a rag belt
  add(ell(X(sh[0] - 2), Y(sh[1] + 1), 6.2, 4.2, -0.3), M.moss, 2.3, { rim: 2.2, tex: 0.8 });                    // moss on the shoulders
  for (const [a, b, c, d] of [[-2, -6, 4, -1], [-1, 0, 5, 4], [2, 5, 6, 9]]) add(cap(X(mid[0] + a), Y(mid[1] + b), 0.55, X(mid[0] + c), Y(mid[1] + d), 0.55), null, 2.4, { emit: '#FF5AD8' });   // magenta seams: the accent
  // ---- head ----
  const hX = X(hd[0]), hY = Y(hd[1]);
  const horn = [[hX + 2, hY - 5, 2.8], [hX + 0.5, hY - 11, 2.2], [hX - 4, hY - 16, 1.5], [hX - 9, hY - 15.5, 0.9], [hX - 11.5, hY - 11.5, 0.4]];
  add(chain(horn.map(([x, y, r], i) => [x + p.hornSw * i * 0.3, y, r])), M.bone, 2.8, { rim: 2.2, hi: 1 });
  add(thorn(hX + 5, hY - 3, hX + 12, hY - 8, 3.4, -1), M.skin, 2.6, { rim: 1.5 });                            // ears swept back
  add(thorn(hX + 4, hY - 1, hX + 11, hY - 2, 3, 0.5), M.skinD, 2.55, { rim: 1.5 });
  add(ell(hX, hY, 8.2, 7.4, -0.1 - p.tilt), M.skin, 3, { rim: 4 });
  const face = ell(hX - 2.2, hY + 0.8, 6.4, 6.6);
  add(inter(face, box(hX - 8, hY, 16, 20)), M.bone, 3.1, { rim: 3.2, hi: 1 });                                // the mask: ivory half
  add(inter(face, box(hX + 4 - 2.2, hY, 8, 20)), M.violet, 3.1, { rim: 3.2 });                               // violet half
  add(box(hX - 2.2, hY + 0.5, 1.2, 12), M.dark, 3.2, { flat: 1, nl: 1 });                                      // the split
  add(box(hX - 5.4, hY - 0.8, 3.4, 2, 0.1), M.dark, 3.3, { flat: 1, nl: 1 });                                  // eye slits
  add(box(hX + 0.6, hY - 0.8, 3.4, 2, -0.1), M.dark, 3.3, { flat: 1, nl: 1 });
  add(box(hX - 5.3, hY - 0.8, 2, 1, 0), null, 3.4, { emit: '#FF5AD8' });
  add(box(hX + 0.9, hY - 0.8, 2, 1, 0), null, 3.4, { emit: '#FF5AD8' });
  const jw = Math.round(p.jaw);
  add(box(hX - 3, hY + 4.2 + jw * 0.5, 7, 1.6 + jw), M.dark, 3.3, { flat: 1, nl: 1 });
  for (const dx of [-5.5, -1.5]) add(poly([hX + dx, hY + 3.6, hX + dx + 1.6, hY + 3.6, hX + dx + 0.8, hY + 5.4 + jw * 0.5]), M.bone, 3.4, { flat: 1, nl: 1 });
  // ---- near leg and arm (in front) ----
  leg(hip[0] - 3, hip[1] + 2, p.nfx, p.nfy, p.nfl, M.skin, 4);
  const nearTip = arm(sh[0] - 2, sh[1] + 4, p.na1, p.na2, 10, 9, M.skin, M.bone, 4.5, 1);
  return { near: [nearTip[0] + dx0, nearTip[1] + dy0], far: [farTip[0] + dx0, farTip[1] + dy0] };
}
