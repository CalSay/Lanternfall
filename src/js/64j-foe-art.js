// 64j-foe-art: approved enemy art packs on the stage (data: FOE_ART, 21za, tools/art/embed-foes.mjs). Browser-only.
// The first is Codex's Thorn Imp (art/enemies/thorn-imp/v1, owner-approved 2026-10-01): 14 poses, LEFT facing, drawn
// at the heroes' scale (1 art px = 1 logical px; standing idle 64 px against the heroes' 96).
// Each frame keeps its approved PNG bytes, so it decodes asynchronously: the canvases exist at once (blank) and are
// filled when their image loads (well before a player reaches a fight).
//   foeArtFrames(key) -> the enemyFrames set (60b): { idle0, idle1, wind, strike, hit, poses: { <pose id>: frame } }
//        frame = { c, ox, oy, x0, lights, art } (ox, oy: the pose's ground anchor in its 128 x 96 cell; x0: its leftmost
//        opaque column, so ox - x0 is how far its blade reaches toward the hero)
//   foeArtHas(key) -> bool
//   FOE_SEQ[key] -> that foe's pose chains (62-stage plays them): { <move>: { wind, hit, rec }, hurt, stagger, dead }
var foeArtFrames, foeArtHas;
// Pose chains, from the pack's README. Per move: wind[i] is held through hit i's wind-up, hit[i] shows at its contact,
// rec after the last contact. The turn engine's events drive them (59k: parryWindow, foeContact), so a pose never
// deals damage of its own.
const FOE_SEQ = {
  imp: {
    // Briar Jab: 01 -> 02 (wind-up) -> 03 (hit 1) -> 04 -> 01
    jab: { wind: ['jab-wind-up'], hit: ['jab-contact'], rec: ['jab-recovery'] },
    // Crosscut: 01 -> 05 (slow) -> 06 (hit 1) -> 07 (fast) -> 08 (hit 2) -> 09 -> 01
    cross: { wind: ['crosscut-wind-up', 'reverse-wind-up'], hit: ['first-slash', 'second-slash'], rec: ['crosscut-recovery'] },
    // Royal Rip (the Captain, not wired until its recolour is approved): 13 -> 06, 07 -> 08, 02 -> 14 -> 04
    rip: { wind: ['royal-rip-wind-up', 'reverse-wind-up', 'jab-wind-up'], hit: ['first-slash', 'second-slash', 'royal-rip-finish'], rec: ['jab-recovery'] },
    hurt: 'hurt', stagger: 'staggered', dead: 'defeated'
  }
};
{
  const cache = {};
  foeArtHas = key => typeof FOE_ART === 'object' && !!FOE_ART[key];
  foeArtFrames = key => {
    if (!foeArtHas(key) || typeof document === 'undefined') return null;
    if (cache[key]) return cache[key];
    const P = FOE_ART[key], poses = {};
    for (const [id, [ax, ay, b64, x0]] of Object.entries(P.frames)) {
      const c = document.createElement('canvas'); c.width = P.w; c.height = P.h; c._pend = true;   // 62-stage measures it again once loaded
      const img = new Image();
      img.onload = () => { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0); c._pend = false; };
      img.src = 'data:image/png;base64,' + b64;
      poses[id] = { c, ox: ax, oy: ay, x0, lights: [], art: c };
    }
    const idle = poses.idle;
    return (cache[key] = { idle0: idle, idle1: idle, wind: poses['jab-wind-up'] || idle, strike: poses['jab-contact'] || idle,
      hit: poses.hurt || idle, poses, art: key });
  };
  // decode every pack at boot, so a save that opens in a fight finds its foe's frames ready
  if (typeof document !== 'undefined') for (const k in (typeof FOE_ART === 'object' ? FOE_ART : {})) foeArtFrames(k);
}
