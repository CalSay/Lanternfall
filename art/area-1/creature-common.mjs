// art/area-1/creature-common.mjs: helpers shared by ravager.mjs, thornwing.mjs, sorcerer.mjs (dissolve, trail and spark fx, def builder).
import { Sprite, blankImg, sampleKeys, poly, chain } from './kit.mjs';

export const FX_CELL = [176, 128], FX_ORIGIN = [132, 104];

// dissolve: remove pixels by a fixed random threshold as `u` goes 0..1, lifting what is left (the body unravels, it does not bleed)
export function dissolve(img, u, seed = 3, liftPx = 6) {
  const o = blankImg(img.w, img.h), lift = Math.round(u * liftPx);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    const i = (y * img.w + x) * 4; if (!img.d[i + 3]) continue;
    const h = (((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0) % 1000 / 1000, hy = y - lift;
    if (h < u * 1.15 - (y / img.h) * 0.25 || hy < 0) continue;
    const j = (hy * img.w + x) * 4; o.d[j] = img.d[i]; o.d[j + 1] = img.d[i + 1]; o.d[j + 2] = img.d[i + 2]; o.d[j + 3] = 255;
  }
  return o;
}

export const star = (cx, cy, rr, n = 12) => { const pts = []; for (let q = 0; q < n; q++) { const a = q / n * Math.PI * 2, d = q % 2 ? rr * 0.4 : rr; pts.push(cx + Math.cos(a) * d, cy + Math.sin(a) * d); } return poly(pts); };

// cfg = { key, cell, origin, draw(S, pose, ox, oy) -> tips, pose0, timings: {act: {loop,start,end,rel,con,ms}}, idle: i -> pose, hop[], hurt[], stagger[], death[],
//   dissolveFrom (death frame index where the dissolve starts, default 4), moves: { id: { keys, contacts, windows, who(k) -> tip name, spark: [colour, colour], trail: [colour, colour], fx?(i, ctx) -> {atk, hit} } } }
export function makeDef(cfg) {
  const { cell, origin, pose0 } = cfg, T = cfg.timings;
  const key = (list, i) => sampleKeys(list, i + 1, pose0);   // keys are by one-based frame number
  const render = p => { const S = new Sprite(...cell); const t = cfg.draw(S, p, ...origin); const img = S.render(); img.tips = t; return img; };
  const tipsOf = p => { const S = new Sprite(...cell); return cfg.draw(S, p, ...origin); };
  const acts = {
    idle: { ...T.idle, frame: i => ({ body: render(cfg.idle(i)) }) },
    hop: { ...T.hop, frame: i => ({ body: render(cfg.hop[i]) }) },
    hurt: { ...T.hurt, frame: i => ({ body: render(cfg.hurt[i]) }) },
    stagger: { ...T.stagger, frame: i => ({ body: render(cfg.stagger[i]) }) },
    death: { ...T.death, frame: (i, n) => {
      if (i === n - 1) return { body: blankImg(...cell) };
      const d0 = cfg.dissolveFrom || 4, img = render(cfg.death[Math.min(i, cfg.death.length - 1)]);
      return { body: i < d0 ? img : dissolve(img, (i - d0 + 1) / (n - d0 - 0.4), 3, cfg.liftPx || 6) };
    } }
  };
  const mk = (id, M) => {
    const n = T[id].ms.length;
    const ctx = { origin, cell, key: i => key(M.keys, i), tipAt: (k, who) => tipsOf(key(M.keys, k))[who || M.who(k)], FX_ORIGIN, FX_CELL };
    const fx = i => {
      if (M.fx) return M.fx(i, ctx);
      const j = i + 1, atk = blankImg(...FX_CELL), hit = blankImg(...FX_CELL);
      const hot = M.windows.find(w => j >= w[0] && j <= w[1]);
      const off = k => [FX_ORIGIN[0] - origin[0], FX_ORIGIN[1] - origin[1]];
      if (hot) {
        const S = new Sprite(...FX_CELL, { noOutline: true }), pts = [], [ax, ay] = off();
        for (let k = Math.max(0, i - (M.trailLen == null ? 1 : M.trailLen)); k <= i; k++) { const q = ctx.tipAt(k), l = pts[pts.length - 1]; if (l && Math.hypot(q[0] - l[0], q[1] - l[1]) > (M.trailMax || 26)) pts.length = 0; pts.push(q); }
        const tr = pts.map((p, q) => [ax + p[0], ay + p[1], 0.6 + q * 0.9]);
        if (tr.length > 1) S.add(chain(tr), null, 1, { emit: M.trail[0] });
        S.add(chain(tr.map(([x, y, r]) => [x, y, Math.max(0.3, r - 1.2)])), null, 2, { emit: M.trail[1] });
        Object.assign(atk, S.render());
      }
      const c = M.contacts.find(c => j >= c && j <= c + 1);
      if (c) {
        const t = ctx.tipAt(c - 1), [ax, ay] = off(), cx = ax + t[0] + (M.sparkDx == null ? -4 : M.sparkDx), cy = ay + t[1] + (M.sparkDy || 0), r = [5, 8, 6][j - c] * (M.sparkScale || 1), S = new Sprite(...FX_CELL, { noOutline: true });
        S.add(star(cx, cy, r), null, 1, { emit: M.spark[0] }); S.add(star(cx, cy, r * 0.55), null, 2, { emit: M.spark[1] });
        Object.assign(hit, S.render());
      }
      return { atk, hit };
    };
    acts[id] = { ...T[id], atk: true, hit: true, frame: i => { const f = fx(i); return { body: render(key(M.keys, i)), atk: f.atk, hit: f.hit }; } };
  };
  for (const [id, M] of Object.entries(cfg.moves)) mk(id, M);
  return { key: cfg.key, cell, origin, fxCell: FX_CELL, fxOrigin: FX_ORIGIN, hopMove: cfg.hopMove || [140, 430], mouth: null, acts, fx: {} };
}

// shared base timings (ms per frame; proposals). Moves are given by each creature.
export const BASE_TIMINGS = {
  idle: { loop: 1, start: 1, end: 4, rel: [], con: [], ms: [220, 260, 260, 220], atk: false, hit: false },
  hop: { loop: 0, start: 1, end: 6, rel: [], con: [], ms: [140, 70, 120, 100, 120, 180], atk: false, hit: false },
  hurt: { loop: 0, start: 1, end: 4, rel: [], con: [], ms: [110, 110, 130, 220], atk: false, hit: false },
  stagger: { loop: 0, start: 1, end: 4, rel: [], con: [], ms: [120, 220, 550, 240], atk: false, hit: false },
  death: { loop: 0, start: 1, end: 9, rel: [], con: [], ms: [220, 130, 160, 180, 160, 150, 160, 220, 600], atk: false, hit: false }
};
