// 89-eyes-hook: LF_EYES, what a player sees, for tools/eyes.mjs (qa-player-eyes). BROWSER FILE, read only.
// It changes no state, adds no timers and keeps no save field. The one thing it touches is SFX.play (76-audio): it is
// wrapped to log the name of each sound the game asks for, then calls the original unchanged.
//
//   LF_EYES.rects()  -> { stage, hero, foe, boss, foes, heroHp, foeHp, tip, ring }  boxes { x, y, w, h } in CSS px of the page
//                       (null when not on screen). hero / foe / boss are the drawn sprite's opaque bounds on the stage canvas,
//                       heroHp / foeHp the two HP plates, tip the guide's sentence band, ring its marker.
//   LF_EYES.phase()  -> 'idle' | 'player turn' | 'foe wind-up' | 'parry or dodge window'
//   LF_EYES.tip()    -> { action, text, target, button } | null   the guide hint on screen: its step id, sentence, marker box,
//                       and the action bar button it names ({ sel, hidden, greyed }, null for a step that names none)
//   LF_EYES.sfx()    -> [{ name, prio }]   sounds asked for since the last call (the list is then cleared)
//   LF_EYES.floats() -> [{ txt, big, crit, left }]   the stage's floating texts still alive
//   LF_EYES.info()   -> { v, zoom, w, h }   page size and the stage zoom
{
  const box = (x, y, w, h) => ({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10 });
  const shown = n => !!(n && !n.hidden && n.getClientRects().length);
  const domBox = n => { if (!shown(n)) return null; const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? box(r.left, r.top, r.width, r.height) : null; };
  const one = sel => domBox(document.querySelector(sel));

  // The opaque part of a frame canvas (alpha > 40, as 62-stage measures edges): left, top, right, bottom in canvas px.
  const bounds = new WeakMap();
  function opaque(c) {
    let b = bounds.get(c);
    if (b !== undefined) return b;
    b = { l: 0, t: 0, r: c.width, b: c.height };
    try {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
      let l = W, t = H, r = -1, bt = -1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 40) { if (x < l) l = x; if (x > r) r = x; if (y < t) t = y; bt = y; }
      if (r >= 0) b = { l, t, r: r + 1, b: bt + 1 };
    } catch (e) { /* a tainted or pending canvas: the whole frame */ }
    if (!c._pend) bounds.set(c, b);
    return b;
  }

  const sfxLog = [];
  if (typeof SFX === 'object' && SFX && typeof SFX.play === 'function') {
    const play = SFX.play;
    SFX.play = function (name, prio) { sfxLog.push({ name, prio: !!prio }); if (sfxLog.length > 200) sfxLog.shift(); return play.apply(this, arguments); };
  }

  // The action bar buttons a guide step names (75-onboard-ui SOLO_UI).
  const BTN = { attack: '#soloBar .sb-atk', ability: '#soloBar .sb-ab0', dodge: '#soloBar .sb-dodge', parry: '#soloBar .sb-parry' };
  const greyedBtn = n => !n || n.hidden || n.disabled || n.getAttribute('aria-disabled') === 'true' || n.classList.contains('off') || n.classList.contains('cd');

  function rects() {
    const out = { stage: null, hero: null, foe: null, boss: null, foes: [], heroHp: one('.hero-plate'), foeHp: one('.mob'), tip: one('.ob-bub'), ring: null };
    const ring = document.querySelector('.ob-ring'), lay = document.querySelector('.ob-layer');
    if (out.tip && ring && lay && !lay.hidden) out.ring = domBox(ring);
    const st = document.getElementById('stage');
    if (!st || typeof stageRects !== 'function') return out;
    const sr = st.getBoundingClientRect(); out.stage = box(sr.left, sr.top, sr.width, sr.height);
    let R; try { R = stageRects(); } catch (e) { return out; }
    if (!R) return out;
    const put = s => {
      const o = opaque(s.c), z = R.ZM || 1;
      return box(sr.left + (s.x + o.l) * z, sr.top + (s.y + o.t) * z, (o.r - o.l) * z, (o.b - o.t) * z);
    };
    if (R.hero) out.hero = put(R.hero);
    for (const f of R.foes) { const b = Object.assign({ key: f.key, boss: f.boss }, put(f)); out.foes.push(b); if (f.boss) { if (!out.boss) out.boss = b; } else if (!out.foe) out.foe = b; }
    return out;
  }

  function phase() {
    let q = null;
    try { q = typeof turnCombatOn === 'function' && turnCombatOn() ? turnCombatSnapshot() : null; } catch (e) { q = null; }
    if (!q || q.phase === 'off') return 'idle';
    if (q.phase === 'hero' || q.phase === 'timing') return 'player turn';
    if (q.phase === 'foeWindup') {
      if (!q.canDefend) return 'foe wind-up';
      const open = Math.min(q.parryOpensAt || 1e9, q.dodgeOpensAt || 1e9);
      return q.now >= open ? 'parry or dodge window' : 'foe wind-up';
    }
    return 'idle';   // intro, handoff, recovery
  }

  function tip() {
    const bub = document.querySelector('.ob-bub'), lay = document.querySelector('.ob-layer');
    if (!shown(bub) || !lay || lay.hidden) return null;
    const txt = bub.querySelector('.ob-txt');
    let action = ''; try { action = typeof soloGuideWants === 'function' ? soloGuideWants() : ''; } catch (e) { action = ''; }
    const sel = BTN[action] || '', n = sel ? document.querySelector(sel) : null;
    const r = rects();
    return { action, text: txt ? txt.textContent.trim() : '', target: r.ring, button: sel ? { sel, hidden: !shown(n), greyed: greyedBtn(n) } : null };
  }

  function sfx() { return sfxLog.splice(0, sfxLog.length); }
  function floats() { try { return typeof stageRects === 'function' ? stageRects().floats : []; } catch (e) { return []; } }
  function info() { let z = 1; try { z = stageRects().ZM; } catch (e) { /* no stage yet */ } return { v: 1, zoom: z, w: innerWidth, h: innerHeight }; }

  window.LF_EYES = Object.freeze({ rects, phase, tip, sfx, floats, info });
}
