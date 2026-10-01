// 75-turn-ui: the turn-based prototype's screens (C20 engine in 59k-turn.js; owner design in docs/design/combat-turns.md).
//   Versus card  opens each fight (fightStart): the hero on the left, the foe on the right, both Haste numbers, and a
//                banner saying who goes first. It lasts as long as the engine's intro (TURN_TUNE.introHand / introAuto);
//                with reduced motion it only fades.
//   Turn strip   at the top of the stage while a turn fight runs: the next 4 turns as portraits, the current one lit,
//                and under it a timing bar while the foe winds up (the dodge and parry windows marked).
//   Action bar   in a turn fight the ability slots and Attack show cooldowns in turns, not seconds (75-solo-ui reads
//                turnBarInfo()); hero actions dim outside the hero's turn.
//   Test switch  Journal > Test: "Turn-based fights (zone 1)". Kept in this browser only (localStorage), never in the
//                save, so the shipped game stays on the legacy fight until the owner decides.
var turnBarInfo = () => null;

{
  const TEST_KEY = 'lanternfall.test.turns';
  const readTest = () => { try { return localStorage.getItem(TEST_KEY) === '1'; } catch (e) { return false; } };
  const writeTest = v => { try { if (v) localStorage.setItem(TEST_KEY, '1'); else localStorage.removeItem(TEST_KEY); } catch (e) {} };
  const setOn = v => { if (typeof TURN_TUNE === 'object') TURN_TUNE.on = v ? 1 : 0; };
  setOn(readTest());

  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const box = $('stageBox');
  const heroName = () => { const k = soloHero(); return (k && SOLO_HEROES[k] && (SOLO_HEROES[k].name || SOLO_HEROES[k].n)) || S.name || 'You'; };
  const heroFace = () => { try { const id = typeof heroArtId === 'function' && heroArtId(); const u = id && typeof heroArtPortraitURL === 'function' ? heroArtPortraitURL(id) : ''; return u || (typeof portraitURL === 'function' ? portraitURL('hero') : ''); } catch (e) { return ''; } };
  // the foe as the stage draws it (enemyFrames idle0), cropped to its opaque box, once per kind
  const foeFaces = new Map();
  const foeFace = f => {
    if (!f) return '';
    const type = String(f.key || '').replace(/\d+$/, ''), k = type + '|' + (typeof zoneHue === 'function' ? zoneHue(S.zone) : 0);
    if (foeFaces.has(k)) return foeFaces.get(k);
    let url = '', pend = false;
    try {
      const set = enemyFrames(type, { elder: false, hue: typeof zoneHue === 'function' ? zoneHue(S.zone) : 0 });
      const fr = set && set.idle0, src = fr && (fr.art || fr);
      pend = !!(src && src._pend);   // a pack frame still decoding (64j): try again next fight
      if (src && src.width) {
        const g0 = src.getContext('2d'), d = g0.getImageData(0, 0, src.width, src.height).data;
        let x0 = src.width, y0 = src.height, x1 = -1, y1 = -1;
        for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) if (d[(y * src.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 >= x0) {
          const w = x1 - x0 + 1, h = y1 - y0 + 1, s = Math.max(w, h), c = document.createElement('canvas'); c.width = s; c.height = s;
          const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(src, x0, y0, w, h, (s - w) >> 1, s - h, w, h);
          url = c.toDataURL();
        }
      }
    } catch (e) { url = ''; }
    if (!pend) foeFaces.set(k, url);
    return url;
  };
  const foeNow = () => { try { return combatFoes().find(x => x && !x.dead && x.hp > 0) || null; } catch (e) { return null; } };
  const img = (cls, url, alt) => { const i = el('img', cls); i.alt = alt || ''; if (url) i.src = url; return i; };

  // ---- the versus card ----
  const card = el('div', 'tv-card'); card.hidden = true; card.setAttribute('role', 'status'); card.setAttribute('aria-live', 'polite');
  const side = cls => { const s = el('div', 'tv-side ' + cls), f = el('div', 'tv-face'), n = el('b', 'tv-name'), h = el('span', 'tv-haste'); s.append(f, n, h); return { s, f, n, h }; };
  const L = side('hero'), R = side('foe'), vs = el('div', 'tv-vs', 'VS'), banner = el('div', 'tv-banner');
  const row = el('div', 'tv-row'); row.append(L.s, vs, R.s); card.append(row, banner);
  if (box) box.append(card);
  let cardT = null, cardAt = 0;
  on('fightStart', p => {
    if (!box || !p) return;
    const f = foeNow(), fname = (f && f.name) || 'The foe', heroFirst = p.first === 'hero';
    L.f.replaceChildren(img('tv-img', heroFace(), heroName())); putText(L.n, heroName()); putText(L.h, `Haste ${p.heroHaste}`);
    R.f.replaceChildren(img('tv-img', foeFace(f), fname)); putText(R.n, fname);
    // C25: a foe kind you have not beaten yet keeps its haste hidden
    const known = !(f && typeof masteryApi === 'object' && masteryApi.typeKills) || masteryApi.typeKills(f.type) >= 1;
    putText(R.h, known ? `Haste ${p.foeHaste}` : 'Haste ?');
    putText(banner, heroFirst ? 'You go first' : `${fname} goes first`);
    card.classList.toggle('foe-first', !heroFirst);
    card.classList.toggle('calm', reduced());
    const secs = typeof TURN_TUNE === 'object' ? (soloActive() ? TURN_TUNE.introHand : TURN_TUNE.introAuto) : 1.2;
    card.style.setProperty('--tv-dur', secs + 's');
    card.hidden = false; card.classList.remove('play'); void card.offsetWidth; card.classList.add('play');
    cardAt = performance.now();
    // the card follows the engine's intro (draw() closes it when the phase moves on); the timer is only a backstop
    clearTimeout(cardT); cardT = setTimeout(() => { card.hidden = true; card.classList.remove('play'); }, secs * 2000);
  });
  on('fightEnd', () => { clearTimeout(cardT); card.hidden = true; });

  // ---- the turn strip and the timing bar ----
  const strip = el('div', 'tv-strip'); strip.hidden = true; strip.setAttribute('aria-label', 'Turn order');
  const slots = []; for (let i = 0; i < 4; i++) { const s = el('div', 'tv-slot'); slots.push(s); strip.append(s); }
  const turnN = el('span', 'tv-n');
  const bar = el('div', 'tv-time'), fill = el('i', 'tv-fill'), dz = el('i', 'tv-dodge'), pz = el('i', 'tv-parry');
  bar.append(dz, pz, fill); bar.hidden = true; bar.setAttribute('aria-hidden', 'true');
  const wrap = el('div', 'tv-top'); wrap.append(strip, turnN, bar);
  if (box) box.append(wrap);
  let lastSig = '', winT0 = 0;
  on('parryWindow', () => { winT0 = 0; });
  const current = s => s.phase === 'hero' ? 'hero' : s.phase === 'foeWindup' ? 'foe' : s.next || 'hero';
  function draw() {
    const on_ = typeof turnCombatOn === 'function' && turnCombatOn() && typeof turnCombatSnapshot === 'function';
    const s = on_ ? turnCombatSnapshot() : null, live = !!(s && s.phase !== 'off');
    if (!card.hidden && (!s || s.phase !== 'intro') && performance.now() - cardAt > 250) { card.hidden = true; card.classList.remove('play'); }
    if (wrap.hidden === live) wrap.hidden = !live;
    if (strip.hidden === live) strip.hidden = !live;
    if (!live) { if (!bar.hidden) bar.hidden = true; return; }
    const who = current(s), order = []; let w = who;
    for (let i = 0; i < 4; i++) { order.push(w); w = w === 'hero' ? 'foe' : 'hero'; }
    const f = foeNow(), sig = order.join() + '|' + (f && f.key) + '|' + s.phase;
    if (sig !== lastSig) {
      lastSig = sig;
      const hf = heroFace(), ff = foeFace(f);
      order.forEach((o, i) => {
        const sl = slots[i]; sl.className = 'tv-slot ' + o + (i === 0 ? ' now' : '');
        sl.replaceChildren(img('tv-mini', o === 'hero' ? hf : ff, o === 'hero' ? heroName() : ((f && f.name) || 'Foe')));
      });
      strip.setAttribute('aria-label', `Turn order: ${order.map(o => o === 'hero' ? 'you' : ((f && f.name) || 'the foe')).join(', then ')}`);
    }
    putText(turnN, s.n ? `Turn ${s.n}` : '');
    // the foe winds up: the bar fills to the hit; the dodge and parry windows sit at its end
    const winding = s.phase === 'foeWindup' && s.closesAt > s.now;
    if (bar.hidden === winding) bar.hidden = !winding;
    if (winding) {
      if (!winT0 || winT0 > s.now) winT0 = s.now;
      const span = Math.max(0.1, s.closesAt - winT0), pct = x => Math.max(0, Math.min(100, x * 100)) + '%';
      fill.style.width = pct((s.now - winT0) / span);
      dz.style.left = pct((s.dodgeOpensAt - winT0) / span); dz.style.width = pct((s.closesAt - s.dodgeOpensAt) / span);
      pz.style.left = pct((s.parryOpensAt - winT0) / span); pz.style.width = pct((s.closesAt - s.parryOpensAt) / span);
    } else winT0 = 0;
  }
  (function loop() { try { draw(); } catch (e) {} requestAnimationFrame(loop); })();

  // ---- the action bar in a turn fight (75-solo-ui asks) ----
  turnBarInfo = () => {
    if (!(typeof turnCombatOn === 'function' && turnCombatOn())) return null;
    const s = turnCombatSnapshot(); if (!s || s.phase === 'off') return null;
    const max = id => (typeof turnCdFor === 'function' ? turnCdFor(id) : 1);
    return { cds: s.cooldowns, max, heroTurn: s.phase === 'hero', windup: s.phase === 'foeWindup' };
  };

  // ---- Journal > Test: the switch ----
  registerSection('log', {
    id: 'turn-test', title: 'Test',
    mount(sec) {
      const p = el('p', 'note', 'Try the new turn-based fights. Zone 1 only. Bosses and other zones fight as before. This switch stays in this browser; your save does not change.');
      const b = el('button', 'big tv-switch'); b.type = 'button';
      const paint = () => { const v = readTest(); putText(b, v ? 'Turn-based fights: On' : 'Turn-based fights: Off'); putAttr(b, 'aria-pressed', String(v)); };
      b.addEventListener('click', () => { const v = !readTest(); writeTest(v); setOn(v); paint(); toast(v ? 'Turn-based fights are on in zone 1.' : 'Turn-based fights are off.', 'good', null, 'low'); });
      paint(); sec.append(p, b);
    },
    update() {}
  });
}
