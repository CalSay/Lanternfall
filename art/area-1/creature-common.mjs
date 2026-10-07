// art/area-1/creature-common.mjs: helpers shared by ravager.mjs, thornwing.mjs, sorcerer.mjs (dissolve, trail and spark fx, def builder).
import { Sprite, blankImg, sampleKeys, rgb } from './kit.mjs';

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

// ---------- hand-placed pixel effects (no primitives): ascii stamps and ragged smears ----------
// An ascii stamp: '.' empty, '1' light, '2' mid, '3' dark (index into the palette [light, mid, dark]); its centre lands on (cx, cy).
export function stamp(img, art, cx, cy, pal) {
  const h = art.length, w = Math.max(...art.map(r => r.length)), ox = Math.round(cx - w / 2), oy = Math.round(cy - h / 2);
  art.forEach((row, y) => [...row].forEach((ch, x) => {
    const k = '123'.indexOf(ch), px = ox + x, py = oy + y; if (k < 0 || px < 0 || py < 0 || px >= img.w || py >= img.h) return;
    const j = (py * img.w + px) * 4, c = rgb(pal[k]); img.d[j] = c[0]; img.d[j + 1] = c[1]; img.d[j + 2] = c[2]; img.d[j + 3] = 255;
  }));
}
const h2 = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
// a ragged streak along the path of a tip (newest point last): broken, two to three tones, widest and palest at the head
export function smear(img, pts, pal, seed = 1) {
  const total = pts.reduce((a, p, i) => a + (i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0) || 1; let run = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0))), nx = -(y1 - y0) / (Math.hypot(x1 - x0, y1 - y0) || 1), ny = (x1 - x0) / (Math.hypot(x1 - x0, y1 - y0) || 1);
    for (let q = 0; q < L; q++) {
      const t = (run + q) / total, x = x0 + (x1 - x0) * q / L, y = y0 + (y1 - y0) * q / L, wid = 1 + t * 2.4;
      for (let o = -Math.round(wid); o <= Math.round(wid); o++) {
        const px = Math.round(x + nx * o), py = Math.round(y + ny * o); if (h2(px, py, seed) < 0.1 + (1 - t) * 0.25 + Math.abs(o) * 0.08) continue;
        if (px < 0 || py < 0 || px >= img.w || py >= img.h) continue;
        const k = Math.abs(o) > wid - 0.8 ? 2 : t > 0.65 && Math.abs(o) < 1 ? 0 : 1, c = rgb(pal[k]), j = (py * img.w + px) * 4; img.d[j] = c[0]; img.d[j + 1] = c[1]; img.d[j + 2] = c[2]; img.d[j + 3] = 255;
      }
    }
    run += L;
  }
}

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
      const hot = M.windows.find(w => j >= w[0] && j <= w[1]), [ax, ay] = [FX_ORIGIN[0] - origin[0], FX_ORIGIN[1] - origin[1]];
      if (hot) {   // a ragged streak behind the tip, only across frames that are close together
        const pts = [];
        for (let k = Math.max(0, i - (M.trailLen == null ? 2 : M.trailLen)); k <= i; k++) { const q = ctx.tipAt(k), l = pts[pts.length - 1]; if (l && Math.hypot(q[0] - l[0], q[1] - l[1]) > (M.trailMax || 26)) pts.length = 0; pts.push([ax + q[0], ay + q[1]]); }
        if (pts.length > 1) smear(atk, pts, M.trail, j);
      }
      const c = M.contacts.findIndex(c => j >= c && j <= c + 1);
      if (c >= 0) {
        const cj = M.contacts[c], t = ctx.tipAt(cj - 1), arts = M.stamps[c % M.stamps.length];
        stamp(hit, arts[j - cj], ax + t[0] + (M.sparkDx || 0), ay + t[1] + (M.sparkDy || 0), M.spark);
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
