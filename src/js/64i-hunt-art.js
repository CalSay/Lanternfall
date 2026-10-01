// 64i-hunt-art: the interim Hunting art (owner, 2026-10-01: wire Codex's drafts in now; the vetted production pack
// replaces it). Data: HUNT_ART (21z, tools/art/embed-hunt.mjs). Beasts are drawn at the heroes' scale: 1 art px =
// 1 logical px, feet on the bottom row.
//   huntBeastFrames(t) -> frames for enemyFrames('node:hide', { tier: t }) (60b): { idle0, idle1, wind, strike, hit,
//        alert, fallen, ms } with each frame { c, ox, oy, lights, art, artOx, artOy } (art: a half-size copy, like B1's
//        1x art canvas). idle0/idle1 idle, wind the beast's wind-up, strike and hit its hurt pose (the stage shows
//        `strike` while the node shakes), fallen when the beast is spent (63c).
//   huntBgDraw(ctx, SW, GY) -> bool   the hunting grounds behind the scene (62-stage, after the scene's back layers)
//   huntReach() -> px   how far the stage hero's spear thrust reaches right of its feet (0: no hunting art)
var huntBeastFrames, huntBgDraw, huntReach;
{
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); return c; };
  const palOf = s => { const out = []; for (let i = 0; i < s.length; i += 6) { const v = parseInt(s.slice(i, i + 6), 16); out.push([v >> 16 & 255, v >> 8 & 255, v & 255]); } return out; };
  function canvasOf(w, h, rle, pal) {
    const d = heroArtUnrle([0, 0, w, h, rle]), c = mk(w, h), g = c.getContext('2d'), img = g.createImageData(w, h), px = img.data;
    for (let i = 0; i < w * h; i++) { const k = d.idx[i]; if (!k) continue; const p = pal[k - 1]; px[i * 4] = p[0]; px[i * 4 + 1] = p[1]; px[i * 4 + 2] = p[2]; px[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0); return c;
  }
  const half = c => { const h = mk(Math.ceil(c.width / 2), Math.ceil(c.height / 2)), g = h.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, h.width, h.height); return h; };
  const cache = {};
  huntBeastFrames = t => {
    const B = typeof HUNT_ART === 'object' && typeof HUNT_BEASTS === 'object' && HUNT_BEASTS[(t | 0) - 1] && HUNT_ART.beasts[HUNT_BEASTS[(t | 0) - 1].key];
    if (!B || typeof heroArtUnrle !== 'function' || typeof document === 'undefined') return null;
    const key = HUNT_BEASTS[(t | 0) - 1].key; if (cache[key]) return cache[key];
    const pal = palOf(B.pal), fr = {};
    for (const [pose, [ax, w, h, rle]] of Object.entries(B.poses)) {
      const c = canvasOf(w, h, rle, pal), a = half(c);
      fr[pose] = { c, ox: ax, oy: h, lights: [], art: a, artOx: Math.round(ax / 2), artOy: Math.ceil(h / 2) };
    }
    return (cache[key] = { idle0: fr.idle, idle1: fr.idle, wind: fr.windup, strike: fr.hurt, hit: fr.hurt, alert: fr.alert, fallen: fr.fallen, attack: fr.strike, ms: 0 });
  };
  huntReach = () => {
    const id = typeof heroArtId === 'function' && heroArtId(), H = id && typeof HERO_ART === 'object' && HERO_ART.heroes[id], p = H && H.poses.h2;
    return p ? p[0] + p[2] - HERO_ART.ax : 0;
  };
  // The grounds: 2 logical px per art px, centred, the flat earth (art row GROUND) on the stage's ground line.
  const GROUND = 160;
  let bg = null;
  huntBgDraw = (ctx, SW, GY) => {
    if (typeof HUNT_ART !== 'object' || !HUNT_ART.bg || typeof heroArtUnrle !== 'function') return false;
    if (!bg) { const [w, h, rle] = HUNT_ART.bg.rec; bg = canvasOf(w, h, rle, palOf(HUNT_ART.bg.pal)); }
    let k = 2; while (bg.width * k < SW) k++;
    const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bg, Math.round((SW - bg.width * k) / 2), Math.round(GY - GROUND * k), bg.width * k, bg.height * k);
    ctx.imageSmoothingEnabled = sm;
    return true;
  };
}
