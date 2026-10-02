// 64j-foe-art: approved enemy animation packs on the stage (data: FOE_ART, 21za, tools/art/embed-foes.mjs). Browser-only.
// The first is Codex's Thorn Imp (art/enemies/thorn-imp/approved-v2, owner-approved 2026-10-02): seven actions, 55 frames
// (idle 4, hop 6, Briar Jab 12, Crosscut 16, hurt 4, stagger 4, death 9), LEFT facing, at the heroes' scale (1 art px =
// 1 logical px; standing idle 64 px against the heroes' 96). The attacks carry two effect layers: the attack trail
// (always shown) and the landed-hit spark (only on a hit that landed; never on a parry, dodge or miss).
// The atlases keep their approved PNG bytes, so they decode asynchronously: every frame's canvas exists at once (blank,
// c._pend) and is filled when its atlas loads (at boot, well before a fight; 62-stage does not cache measurements of a
// frame still pending).
//   foeArtFrames(key) -> the enemyFrames set (60b): { v2, key, idle0, idle1, wind, strike, hit, acts }
//        acts[action] = { loop, start, end, rel, con (one-based frames, as FOE_ART), fr: [{ ms, body, atk, hit }] }
//        body = { c, ox, oy, x0, lights, art } (ox, oy: the body origin, the grounded rear foot; x0: its leftmost opaque
//        column, so ox - x0 is how far its blade reaches toward the hero); atk / hit = { c, ox, oy } or null (an effect
//        cell, drawn so both layers share the body's world root).
//   foeArtHas(key) -> bool
var foeArtFrames, foeArtHas;
{
  const cache = {};
  foeArtHas = key => typeof FOE_ART === 'object' && !!FOE_ART[key];
  foeArtFrames = key => {
    if (!foeArtHas(key) || typeof document === 'undefined') return null;
    if (cache[key]) return cache[key];
    const P = FOE_ART[key], wait = {};   // atlas path -> [[canvas, x, y], ...] cut when it loads
    const cut = (path, x, y, w, h) => {
      if (!path || x < 0) return null;
      const c = document.createElement('canvas'); c.width = w; c.height = h; c._pend = true;
      (wait[path] = wait[path] || []).push([c, x, y]);
      return c;
    };
    const [bw, bh] = P.cell, [fw, fh] = P.fxCell, acts = {};
    for (const [id, A] of Object.entries(P.acts)) {
      acts[id] = Object.assign({}, A, { f: undefined, fr: A.f.map(([ms, bx, by, x0, ax, ay, hx, hy]) => {
        const c = cut(A.body, bx, by, bw, bh), a = A.atk ? cut(A.atk, ax, ay, fw, fh) : null, h = A.hit ? cut(A.hit, hx, hy, fw, fh) : null;
        return { ms, body: { c, ox: P.origin[0], oy: P.origin[1], x0: x0 < 0 ? P.origin[0] : x0, lights: [], art: c },
          atk: a && { c: a, ox: P.fxOrigin[0], oy: P.fxOrigin[1] }, hit: h && { c: h, ox: P.fxOrigin[0], oy: P.fxOrigin[1] } };
      }) });
    }
    for (const [path, list] of Object.entries(wait)) {
      const img = new Image();
      img.onload = () => { for (const [c, x, y] of list) { const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
        g.clearRect(0, 0, c.width, c.height); g.drawImage(img, x, y, c.width, c.height, 0, 0, c.width, c.height); c._pend = false; } };
      img.src = 'data:image/png;base64,' + P.atlases[path];
    }
    const at = (id, i) => acts[id] && acts[id].fr[Math.min(i, acts[id].fr.length - 1)].body;
    return (cache[key] = { v2: true, key, acts, idle0: at('idle', 0), idle1: at('idle', 2), wind: at('jab', 4), strike: at('jab', 8),
      hit: at('hurt', 1), art: key });
  };
  // decode every pack at boot, so a save that opens in a fight finds its foe's frames ready
  if (typeof document !== 'undefined') for (const k in (typeof FOE_ART === 'object' ? FOE_ART : {})) foeArtFrames(k);
}
