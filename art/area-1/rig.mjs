// art/area-1/rig.mjs: small rigging helpers shared by the creature files.
import { chain } from './kit.mjs';
// two-bone IK: the middle joint of a limb from root (hx, hy) toward target (tx, ty); dir +1 / -1 picks which way it bends
export function ik(hx, hy, tx, ty, l1, l2, dir = 1) {
  let dx = tx - hx, dy = ty - hy, d = Math.hypot(dx, dy) || 1e-6;
  const max = l1 + l2 - 0.01; if (d > max) { tx = hx + dx / d * max; ty = hy + dy / d * max; dx = tx - hx; dy = ty - hy; d = max; }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), mx = hx + dx / d * a, my = hy + dy / d * a;
  return [mx - dy / d * h * dir, my + dx / d * h * dir, tx, ty];
}
// a limb as a smooth chain: root, middle, end with radii
export const limb = (root, mid, end, r0, r1, r2) => chain([[root[0], root[1], r0], [mid[0], mid[1], r1], [end[0], end[1], r2]]);
export const rotPt = (x, y, a, cx = 0, cy = 0) => { const c = Math.cos(a), s = Math.sin(a), px = x - cx, py = y - cy; return [cx + px * c - py * s, cy + px * s + py * c]; };
export const polar = (x, y, a, l) => [x + Math.cos(a) * l, y + Math.sin(a) * l];
