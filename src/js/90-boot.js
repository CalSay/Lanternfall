// 90-boot: page lifecycle, boot sequence, timers and the frame loop. Browser-only.

let lastFrame = performance.now();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { save(); flush(); }
  else { const secs = (Date.now() - S.last) / 1000; if (secs > 30) showAwayReport(awayGains(secs)); S.last = Date.now(); lastFrame = performance.now(); }
});
addEventListener('pagehide', save);

// ================= boot =================
resize();
updatePortrait();
showAwayReport(awayGains((Date.now() - S.last) / 1000));
S.last = Date.now();
if (S.hintDone) $('hint').style.opacity = 0;
spawn();
setTab(TAB_IDS.includes(S.tab) ? S.tab : 'adv');
connect();
// Bake every character portrait in idle time, so the first open of the Party tab (a portrait per
// roster row) does not stall for a quarter of a second or more.
if (typeof idleTask === 'function' && typeof portraitURL === 'function') {
  idleTask(() => portraitURL('hero'));
  if (typeof ROSTER_KEYS !== 'undefined') for (const k of ROSTER_KEYS) idleTask(() => portraitURL(k));
}

// Nothing changes while the page is hidden (the frame loop pauses), so skip the autosave then.
// Saving also stamps S.last; doing it from a background timer made the away time come out near zero.
setInterval(() => { if (!document.hidden) save(); }, 5000);
setInterval(() => { flush(); maintainBoss(); }, 4000);
setInterval(pushPresence, 3000);

// ================= warm-up =================
// While a frontier boss is ready or being fought, build the next zone's scene and foes (and this
// zone's boss) in idle time. sceneFor and enemyFrames cache them, so clearing the zone does not
// stall a frame with a scene build and fresh bakes.
let warmKey = '', warmT = 0;
function warmNextZone() {
  if (typeof idleTask !== 'function' || target() !== 'mob' || S.zone !== S.maxZone || !(fightBoss || bossReady())) return;
  const st = $('stage'), w = st.clientWidth, h = st.clientHeight, z = S.zone + 1, key = z + ':' + w + 'x' + h;
  if (!w || !h || key === warmKey) return;
  warmKey = key;
  const hueOf = zz => (zoneCycle(zz) * 70) % 360;
  idleTask(() => enemyFrames(TYPES[zoneType(S.zone)].key, { elder: true, hue: hueOf(S.zone) }));
  idleTask(() => sceneFor(ZONE_THEME[zoneType(z)], w, h, hueOf(z)));
  for (const ti of [zoneType(z), (zoneType(z) + 1) % 7]) idleTask(() => enemyFrames(TYPES[ti].key, { elder: false, hue: hueOf(z) }));
}

function frame(now) {
  let dt = (now - lastFrame) / 1000; lastFrame = now;
  if (dt > 1) dt = 0;
  dt = Math.min(dt, 0.1);
  T += dt;
  tick(dt); animate(dt); draw();
  uiTimer -= dt; slowTick -= dt;
  if (uiTimer <= 0) { uiTimer = 0.2; ui(false); }
  warmT -= dt; if (warmT <= 0) { warmT = 1; warmNextZone(); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
