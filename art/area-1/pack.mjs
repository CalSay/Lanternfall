// art/area-1/pack.mjs: packs rendered frames into the game's enemy-pack format (the shape of FOE_ART in 21za, see 64j-foe-art.js).
// One body atlas and one effect atlas per creature (PNG), frame rects as [ms, x, y, left edge, atk x, y, hit x, y].
import fs from 'node:fs';
import { blankImg, blit, encodePNG, leftEdge, isEmpty } from './kit.mjs';

// The timings of Codex's approved packs (src/js/21za-data-foeart.js): the Thorn Imp and Gloomjaw keep exactly these (so the
// turn-fight parry windows, contacts and release frames in 59l-zone-foes.js do not move), only the drawing changes.
export function codexTimings(key) {
  const s = fs.readFileSync(new URL('../../src/js/21za-data-foeart.js', import.meta.url), 'utf8'), i = s.indexOf('const FOE_ART = ');
  const P = JSON.parse(s.slice(i + 16, s.lastIndexOf('}') + 1))[key], out = { acts: {}, fx: {}, cell: P.cell, origin: P.origin, fxCell: P.fxCell, fxOrigin: P.fxOrigin, hopMove: P.hopMove, mouth: P.mouth };
  for (const [id, A] of Object.entries(P.acts)) out.acts[id] = { loop: A.loop, start: A.start, end: A.end, rel: A.rel, con: A.con, ms: A.f.map(f => f[0]), atk: !!A.atk, hit: !!A.hit };
  for (const [id, X] of Object.entries(P.fx || {})) out.fx[id] = { loop: X.loop, ms: X.f.map(f => f[0]) };
  return out;
}

// def = { key, cell, origin, fxCell, fxOrigin, hopMove, mouth,
//   acts: { id: { loop, start, end, rel, con, ms: [...], frame(i, n) -> { body: img, atk?: img, hit?: img } } },
//   fx: { id: { loop, ms: [...], frame(i, n) -> img } } }
export function buildPack(def) {
  const [bw, bh] = def.cell, [fw, fh] = def.fxCell, atlases = {}, acts = {}, fx = {};
  const nBody = Object.values(def.acts).reduce((a, A) => a + A.ms.length, 0);
  const cols = 8, body = blankImg(cols * bw, Math.ceil(nBody / cols) * bh);
  let nFx = Object.values(def.acts).reduce((a, A) => a + (A.atk ? A.ms.length : 0) + (A.hit ? A.ms.length : 0), 0) + Object.values(def.fx || {}).reduce((a, X) => a + X.ms.length, 0);
  const fcols = 6, fxa = blankImg(fcols * fw, Math.max(1, Math.ceil(nFx / fcols)) * fh);
  let bi = 0, fi = 0;
  const putFx = img => { const x = (fi % fcols) * fw, y = ((fi / fcols) | 0) * fh; fi++; if (img) blit(fxa, img, x, y); return [x, y]; };
  for (const [id, A] of Object.entries(def.acts)) {
    const n = A.ms.length, f = [];
    for (let i = 0; i < n; i++) {
      const r = A.frame(i, n), x = (bi % cols) * bw, y = ((bi / cols) | 0) * bh; bi++;
      if (r.body.w !== bw || r.body.h !== bh) throw new Error(`${def.key}.${id}: frame ${i} is ${r.body.w}x${r.body.h}, not ${bw}x${bh}`);
      blit(body, r.body, x, y);
      const a = A.atk ? putFx(r.atk) : [-1, -1], h = A.hit ? putFx(r.hit) : [-1, -1];
      f.push([A.ms[i], x, y, leftEdge(r.body), a[0], a[1], h[0], h[1]]);
    }
    acts[id] = { loop: A.loop ? 1 : 0, start: A.start, end: A.end, rel: A.rel || [], con: A.con || [], body: 'body', atk: A.atk ? 'fx' : '', hit: A.hit ? 'fx' : '', f };
  }
  for (const [id, X] of Object.entries(def.fx || {})) {
    const f = []; for (let i = 0; i < X.ms.length; i++) { const p = putFx(X.frame(i, X.ms.length)); f.push([X.ms[i], p[0], p[1]]); }
    fx[id] = { loop: X.loop ? 1 : 0, atlas: 'fx', f };
  }
  const bodyPng = encodePNG(body), fxPng = nFx ? encodePNG(fxa) : null;
  atlases.body = bodyPng.toString('base64'); if (fxPng) atlases.fx = fxPng.toString('base64');
  return { data: { v: 2, cell: def.cell, origin: def.origin, fxCell: def.fxCell, fxOrigin: def.fxOrigin, hopMove: def.hopMove, mouth: def.mouth || null, atlases, fx, acts },
    png: { body: bodyPng, fx: fxPng }, images: { body, fx: fxa } };
}
