// 90-boot: page lifecycle, boot sequence, timers and the frame loop. Browser-only.

let lastFrame = performance.now();
// Boot's away gains (see boot below), applied once: after the first frame, or before a save if the
// page is hidden or closed first.
let bootAway = null;
// save-two-tabs: then save at once, so the newest open tab holds the save (an older tab still on screen stops at its next save).
// Never before the away gains: a save stamps S.last, and that would lose the away time.
function bootAwayNow() { if (bootAway == null) return; const secs = bootAway; bootAway = null; showAwayReport(awayGains(secs)); save(); }
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { bootAwayNow(); save(); flush(); }
  // save-two-tabs: back in front while another tab wrote a newer save, this page's S is old: no away gains, no saves (30-state)
  else if (saveCheck()) { const secs = Math.max(0, (Date.now() - S.last) / 1000); if (secs > 30) showAwayReport(awayGains(secs)); S.last = Date.now(); lastFrame = performance.now(); }
});
addEventListener('pagehide', () => { bootAwayNow(); save(); });

// ================= boot =================
{ const el = typeof document.getElementById === 'function' && document.getElementById('lfLoad'); if (el) el.remove(); }   // the inline page's loading screen (src/shell.html); tools stub document
resize();
updatePortrait();
// The away gains and their card are worked out in a task of their own right after the first frame
// (about 50-120 ms at x4 CPU: other systems' catch-up, the card's Next Up line), so the stage shows
// first. The absence is measured now; the gains are the same.
// never below 0: a save stamped in the future (a device clock set back, a test save) must not pay negative away gains
bootAway = Math.max(0, (Date.now() - S.last) / 1000);
S.last = Date.now();
if (S.hintDone) $('hint').style.opacity = 0;
spawn();
initMenus();  // 70-ui: game view in portrait, last menu open on wide screens
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
// While a frontier boss is ready or being fought, build the next zone's scene (at the stage's own
// size, with its device-size plates: warmScene in 62-stage) and foes (and this zone's boss) in idle
// time, ahead of background bakes. sceneFor, the plates and enemyFrames cache them, so clearing the
// zone does not stall a frame with a scene build and fresh bakes.
let warmKey = '', warmT = 0, bootAwayT = 0;
function warmNextZone() {
  if (typeof idleTask !== 'function' || target() !== 'mob' || S.zone !== S.maxZone || !(fightBoss || bossReady())) return;
  const st = $('stage'), w = st.clientWidth, h = st.clientHeight, z = S.zone + 1, key = z + ':' + w + 'x' + h + ':' + (window.devicePixelRatio || 1);
  if (!w || !h || key === warmKey) return;
  warmKey = key;
  const hueOf = zoneHue;
  // soon: ahead of background bakes (queued in reverse, so the scene runs first, then the foes)
  for (const ti of [zoneNextType(z), zoneType(z)]) idleTask(() => enemyFrames(TYPES[ti].key, { elder: false, hue: hueOf(z) }), true);
  idleTask(() => enemyFrames(TYPES[zoneType(S.zone)].key, { elder: true, hue: hueOf(S.zone) }), true);
  if (!warmScene(z)) warmKey = '';
}

function frame(now) {
  let dt = (now - lastFrame) / 1000; lastFrame = now;
  if (dt > 1) dt = 0;
  dt = Math.min(dt, 0.1);
  T += dt;
  // SOLO1: the game waits while a guide step waits for its action, or while the hero is being chosen (or a feature holds it: gameHeld())
  const stop = ONBOARD.paused || soloPickerOpen() || document.getElementById('createScreen');
  if (!(stop || gameHeld())) tick(dt);   // gameHeld(): features that hold the game register with holdGame (00-util)
  else if (!stop) artHoldTick(dt);   // 75-art-load: a pack still loading holds the fight, not the Forge's orders (load-hold-progress)
  animate(dt); draw();
  uiTimer -= dt; slowTick -= dt;
  if (uiTimer <= 0) { uiTimer = 0.2; ui(false); }
  warmT -= dt; if (warmT <= 0) { warmT = 1; warmNextZone(); }
  if (bootAway != null && !bootAwayT) bootAwayT = setTimeout(bootAwayNow, 0);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
