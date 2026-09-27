// 90-boot: page lifecycle, boot sequence, timers and the frame loop. Browser-only.

let lastFrame = performance.now();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { save(); flush(); }
  else { const secs = (Date.now() - S.last) / 1000; if (secs > 30) showAway(awayGains(secs)); S.last = Date.now(); lastFrame = performance.now(); }
});
addEventListener('pagehide', save);

// ================= boot =================
resize();
updatePortrait();
showAway(awayGains((Date.now() - S.last) / 1000));
S.last = Date.now();
if (S.hintDone) $('hint').style.opacity = 0;
spawn();
setTab(TAB_IDS.includes(S.tab) ? S.tab : 'adv');
connect();

setInterval(save, 5000);
setInterval(() => { flush(); maintainBoss(); }, 4000);
setInterval(pushPresence, 3000);

function frame(now) {
  let dt = (now - lastFrame) / 1000; lastFrame = now;
  if (dt > 1) dt = 0;
  dt = Math.min(dt, 0.1);
  T += dt;
  tick(dt); animate(dt); draw();
  uiTimer -= dt; slowTick -= dt;
  if (uiTimer <= 0) { uiTimer = 0.2; ui(false); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
