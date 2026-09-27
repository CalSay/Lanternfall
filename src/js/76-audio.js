// 76-audio: tiny WebAudio synth for retro sound effects. No audio files.
// BROWSER FILE. Listens to bus events; adds a mute button to the stage corner.
// The AudioContext starts on the first pointerdown (browsers block audio before a gesture).

registerState('settings', { sound: true });

const SFX = (() => {
  const VOL = 0.18;                  // master volume: low by default
  const MAX_PER_SEC = 12;            // throttle so fast hits don't turn into noise
  let ctx = null, master = null, stamps = [];

  function start() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) { ctx = new AC(); master = ctx.createGain(); master.gain.value = VOL; master.connect(ctx.destination); }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }
  // Returns true if a sound may play now. prio sounds skip the rate limit.
  function allow(prio) {
    if (!ctx || !S.settings.sound || ctx.state !== 'running') return false;
    const now = ctx.currentTime;
    stamps = stamps.filter(s => now - s < 1);
    if (!prio && stamps.length >= MAX_PER_SEC) return false;
    stamps.push(now); return true;
  }
  // One enveloped oscillator note. f0 -> f1 pitch slide over dur seconds.
  function tone(f0, f1, dur, type = 'square', vol = 0.5, delay = 0) {
    const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  let noiseBuf = null;
  function noise(dur, freq, vol = 0.4, delay = 0) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ctx.currentTime + delay, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + dur + 0.02);
  }
  const arp = (notes, step, type, vol) => notes.forEach((f, i) => tone(f, f, step * 1.6, type, vol, i * step));

  const sounds = {
    hit: () => { noise(0.05, 1800, 0.25); tone(220, 110, 0.06, 'square', 0.12); },
    party: () => tone(330 + Math.random() * 60, 200, 0.04, 'triangle', 0.08),
    crit: () => { noise(0.09, 2600, 0.4); tone(660, 180, 0.12, 'square', 0.25); },
    kill: () => { tone(988, 988, 0.05, 'square', 0.18); tone(1319, 1319, 0.1, 'square', 0.18, 0.05); },
    ore: () => { tone(1800, 1500, 0.07, 'triangle', 0.35); tone(2700, 2400, 0.05, 'sine', 0.15, 0.01); },
    wood: () => { noise(0.08, 400, 0.5); tone(140, 70, 0.1, 'sine', 0.4); },
    tapNode: () => noise(0.03, 1200, 0.15),
    level: () => arp([523, 659, 784, 1047], 0.07, 'square', 0.22),
    skill: () => arp([392, 523, 659], 0.06, 'triangle', 0.3),
    loot: () => { arp([523, 659, 784, 1047, 784, 1047], 0.09, 'square', 0.25); tone(1568, 1568, 0.5, 'triangle', 0.2, 0.54); },
    forge: () => { noise(0.12, 3000, 0.4); tone(1200, 900, 0.18, 'triangle', 0.3); tone(600, 600, 0.25, 'sine', 0.15, 0.03); },
    fail: () => { tone(392, 370, 0.18, 'square', 0.2); tone(311, 294, 0.18, 'square', 0.2, 0.18); tone(233, 150, 0.4, 'square', 0.2, 0.36); },
    zone: () => arp([392, 523, 659, 784, 1047], 0.08, 'square', 0.22),
    buy: () => tone(880, 1320, 0.05, 'square', 0.15)
  };
  function play(name, prio) { if (allow(prio)) { try { sounds[name](); } catch (e) { /* audio is best-effort */ } } }
  return { start, play };
})();

window.addEventListener('pointerdown', SFX.start, true);

// ================= event wiring =================
on('float', ({ color }) => {
  if (color === '#FFFFFF') SFX.play('hit');
  else if (color === '#FF9E3D') SFX.play('crit');
  else if (color === '#B58CFF' && Math.random() < 0.35) SFX.play('party');
});
on('kill', ({ mob }) => SFX.play('kill', mob && mob.boss));
on('nodeHit', () => SFX.play('tapNode'));
on('harvest', ({ kind }) => SFX.play(kind === 'ore' ? 'ore' : 'wood'));
on('levelup', e => { if (!(e && e.quiet)) SFX.play('level', true); });   // quiet: away levels
on('skillUp', ({ quiet }) => { if (!quiet) SFX.play('skill', true); });
on('loot', () => SFX.play('loot', true));
on('itemAdded', ({ item }) => { if (!item.u) SFX.play('forge', true); });
on('bossFail', () => SFX.play('fail', true));
on('zoneClear', () => SFX.play('zone', true));
// Button taps in the panels (buy, hire, upgrade...). The stage has its own sounds.
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('button');
  if (b && !b.disabled && !b.closest('#stage')) SFX.play('buy');
}, true);

// ================= mute button =================
(() => {
  const st = document.getElementById('stage'); if (!st) return;
  const css = document.createElement('style');
  css.textContent = `.sfx-btn{position:absolute;right:6px;bottom:6px;z-index:5;width:28px;height:28px;padding:0;
    border:2px solid var(--line-hi);background:var(--well);color:var(--bone);font:12px/1 var(--display);
    image-rendering:pixelated;cursor:pointer;opacity:.8}.sfx-btn:hover{opacity:1}.sfx-btn.off{color:var(--muted)}`;
  document.head.append(css);
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'sfx-btn';
  const draw = () => {
    const on_ = S.settings.sound;
    b.textContent = on_ ? '♪' : '×';
    b.classList.toggle('off', !on_);
    b.title = on_ ? 'Sound on. Tap to mute.' : 'Sound off. Tap to unmute.';
    b.setAttribute('aria-label', b.title);
  };
  b.addEventListener('pointerdown', e => e.stopPropagation());
  b.addEventListener('click', e => { e.stopPropagation(); S.settings.sound = !S.settings.sound; draw(); save(); SFX.play('buy'); });
  draw(); st.append(b);
})();
