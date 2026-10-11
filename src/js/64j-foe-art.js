// 64j-foe-art: approved enemy animation packs on the stage (data: FOE_ART, 21za, tools/art/embed-foes.mjs). Browser-only.
// The Thorn Imp is the Scenario pack Cal signed off (10 Oct 2026 19:44; art/enemies/thorn-imp/scenario-v1, tools/art/thorn-imp-s.py):
// LEFT facing, idle (one held frame plus a breathing copy), dash in 4, Briar Jab 6 (never the rejected frames 2 and 7), Crosscut 8,
// hurt 2, stagger 2, death 3 (it lies still, then fades). Every attack dashes in, strikes and dashes out. Its art is 127 px tall,
// drawn as the heroes' route S art is (64l): P.k = 0.5 actor px per art px, so it stands 64 actor px. A pack with k keeps two
// canvases per frame: body.c at actor px (the stage's bounds, reach and head) and body.art at art px with body.hk = k, which
// foeArtBlit draws on whole device px (nearest at 1 device px per art px or more, else one smooth downscale, cached). Gloomjaw
// (Codex) draws at 1 art px = 1 actor px; its attacks carry two effect layers: the attack trail (always shown) and the
// landed-hit spark (only on a hit that landed; never on a parry, dodge or miss).
// The atlases keep their approved PNG bytes, so they decode asynchronously: every frame's canvas exists at once (blank,
// c._pend) and is filled when its atlas loads (at boot, well before a fight; 62-stage does not cache measurements of a
// frame still pending). In the split build a pack's atlases can come after boot (75-art-load): the frames fill then.
//   foeArtFrames(key) -> the enemyFrames set (60b): { v2, key, hk (its k, or 0), idle0, idle1, wind, strike, hit, acts }
//        acts[action] = { loop, start, end, rel, con (one-based frames, as FOE_ART), fr: [{ ms, body, atk, hit }] }
//        body = { c, ox, oy, x0, lights, art } (ox, oy: the body origin, the grounded rear foot; x0: its leftmost opaque
//        column, so ox - x0 is how far its blade reaches toward the hero); atk / hit = { c, ox, oy } or null (an effect
//        cell, drawn so both layers share the body's world root).
//        fx[effect] = { loop, fr: [{ ms, c, ox, oy }] }: a separate effect (Gloomjaw: the throat charge and release, the
//        void bolt, its impact, the bite), drawn by 62-stage at the throat (mouth, from the root), in flight, or on the
//        hero; mouth: [dx, dy] from the world root, or null.
//   foeArtHas(key) -> bool
//   foeArtBlit(g, body, x, y, dim) -> draws a k frame with its world root at (x, y) actor px (dim: the back lane's shade)
var foeArtFrames, foeArtHas, foeArtBlit;
{
  const cache = {}, later = {};   // later: key -> its frames' fill, while its pack's atlases are still loading
  if (typeof on === 'function') on('artPack', e => { const f = e && e.kind === 'foe' && later[e.key]; if (f) f(); });
  foeArtHas = key => typeof FOE_ART === 'object' && !!FOE_ART[key];
  foeArtFrames = key => {
    if (!foeArtHas(key) || typeof document === 'undefined') return null;
    if (cache[key]) return cache[key];
    const P = FOE_ART[key], wait = {}, k = P.k || 1;   // wait: atlas path -> [[canvas, x, y, art canvas, breathe], ...] cut when it loads
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c._pend = true; return c; };
    const cut = (path, x, y, w, h, art, br) => {
      if (!path || x < 0) return null;
      const c = mk(art ? Math.ceil(w * k) : w, art ? Math.ceil(h * k) : h), a = art ? mk(w, h) : null;
      (wait[path] = wait[path] || []).push([c, x, y, a, br]);
      if (a) c._art = a;
      return c;
    };
    const [bw, bh] = P.cell, [fw, fh] = P.fxCell, acts = {}, hk = P.k ? k : 0;
    const body = (c, x0) => { const b = { c, ox: Math.round(P.origin[0] * k), oy: Math.round(P.origin[1] * k), x0: Math.round((x0 < 0 ? P.origin[0] : x0) * k), lights: [], art: c._art || c };
      if (hk) { b.hk = hk; b.aox = P.origin[0]; b.aoy = P.origin[1]; } return b; };
    for (const [id, A] of Object.entries(P.acts)) {
      const fr = A.f.map(([ms, bx, by, x0, ax, ay, hx, hy]) => {
        const c = cut(A.body, bx, by, bw, bh, hk), a = A.atk ? cut(A.atk, ax, ay, fw, fh) : null, h = A.hit ? cut(A.hit, hx, hy, fw, fh) : null;
        return { ms, body: body(c, x0), atk: a && { c: a, ox: P.fxOrigin[0], oy: P.fxOrigin[1] }, hit: h && { c: h, ox: P.fxOrigin[0], oy: P.fxOrigin[1] } };
      });
      // the idle's breathing copy: the same frame, its rows above the waist (the top 60% of the cell, about half the imp) 1 art px lower (64l)
      if (A.br) { const [ms, bx, by, x0] = A.f[A.f.length - 1]; fr.push({ ms: A.br, body: body(cut(A.body, bx, by, bw, bh, hk, true), x0), atk: null, hit: null }); }
      acts[id] = Object.assign({}, A, { f: undefined, end: A.br ? fr.length : A.end, fr });
    }
    const fx = {};
    for (const [id, X] of Object.entries(P.fx || {}))
      fx[id] = { loop: X.loop, fr: X.f.map(([ms, x, y]) => ({ ms, c: cut(X.atlas, x, y, fw, fh), ox: P.fxOrigin[0], oy: P.fxOrigin[1] })) };
    // every body and effect cut above; an atlas still on its way (the split build's area pack, 75-art-load) is cut when it arrives
    const fill = () => { for (const [path, list] of Object.entries(wait)) {
      if (!(path in P.atlases)) continue;
      delete wait[path];
      const img = new Image();
      img.onload = () => { for (const [c, x, y, a, br] of list) {
        const t = a || c, g = t.getContext('2d'); g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, t.width, t.height); g.drawImage(img, x, y, t.width, t.height, 0, 0, t.width, t.height);
        if (br) { const w = Math.round(P.origin[1] * 0.6); g.clearRect(0, 0, t.width, w + 1); g.drawImage(img, x, y, t.width, w, 0, 1, t.width, w); }
        if (a) { const h = c.getContext('2d'); h.imageSmoothingEnabled = true; h.imageSmoothingQuality = 'high'; h.clearRect(0, 0, c.width, c.height); h.drawImage(a, 0, 0, c.width, c.height); a._pend = false; }
        c._pend = false; } };
      img.src = 'data:image/' + (P.fmt || 'png') + ';base64,' + P.atlases[path];
    } if (Object.keys(wait).length) later[key] = fill; else delete later[key]; };
    fill();
    const A0 = I => (I && I.br ? 1 : 2);   // the second idle pose: the breathing copy, or the Codex idle's third frame
    const at = (id, i) => acts[id] && acts[id].fr[Math.min(i, acts[id].fr.length - 1)].body;
    return (cache[key] = { v2: true, key, hk, acts, fx, mouth: P.mouth, idle0: at('idle', 0), idle1: at('idle', A0(acts.idle)), wind: at('idle', 0), strike: at('idle', 0),
      hit: at('hurt', 1), art: key });
  };
  // a k frame on whole device px (as 64l and 64m): (x, y) is its world root in actor px under the stage's transform
  const small = new Map();   // art canvas -> { k, c, d }: its last downscale (and its shaded copy)
  const shade = c => { const d = document.createElement('canvas'); d.width = c.width; d.height = c.height; const g = d.getContext('2d');
    g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(14,9,24,0.26)'; g.fillRect(0, 0, d.width, d.height); return d; };
  foeArtBlit = (g, f, x, y, dim) => {
    const a = f && f.art; if (!a || a._pend) return false;
    const T = g.getTransform(), K = T.a, k = f.hk * K, X = Math.round(K * x + T.e), Y = Math.round(K * y + T.f);
    let src = a, s;
    if (k < 1 || dim) {
      s = small.get(a);
      if (!s || s.k !== k) {
        if (small.size > 120) small.delete(small.keys().next().value);
        const q = k < 1 ? document.createElement('canvas') : a;
        if (k < 1) { q.width = Math.max(1, Math.round(a.width * k)); q.height = Math.max(1, Math.round(a.height * k)); const h = q.getContext('2d'); h.imageSmoothingEnabled = true; h.imageSmoothingQuality = 'high'; h.drawImage(a, 0, 0, q.width, q.height); }
        s = { k, c: q, d: null }; small.set(a, s);
      }
      src = dim ? (s.d = s.d || shade(s.c)) : s.c;
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    const ox = Math.round(f.aox * k), oy = Math.round(f.aoy * k);
    if (k >= 1) { g.imageSmoothingEnabled = false; g.drawImage(src, X - ox, Y - oy, Math.round(a.width * k), Math.round(a.height * k)); }
    else g.drawImage(src, X - ox, Y - oy);
    g.restore();
    return true;
  };
  // decode every pack at boot, so a save that opens in a fight finds its foe's frames ready
  if (typeof document !== 'undefined') for (const k in (typeof FOE_ART === 'object' ? FOE_ART : {})) foeArtFrames(k);
}
