// 75-turn-ui: the turn fight on screen (engine 59k-turn.js; docs/design/combat-turns.md, combat-turn-build.md).
//   Versus card  opens each fight (fightStart): the hero on the left, the foe on the right, both Speeds, and a banner
//                saying who goes first. It lasts the engine's intro; with reduced motion it only fades.
//   Turn strip   at the top of the stage: the next 6 turns as portraits (the Speed gauges decide them), the current
//                one lit; under it a timing bar while the foe winds up a hit (the dodge and parry windows marked).
//   Warnings     a banner when a boss gathers a charged move ("Stun it or hit it hard"), when it is broken, when a boss
//                turns harder at half HP, and "Your turn" while the fight waits on you.
//   Hero row     under the strip: the hero's resource as pips (Aim, Grit, Embers) and their own statuses (Guard, Ward,
//                Keen, and what a boss put on them), with the approved status icons (21v).
//   Action bar   75-solo-ui reads turnBarInfo(): cooldowns in turns, and why a slot cannot be used now.
var turnBarInfo = () => null;

{
  // checks only (tools/check.mjs): a browser test of the real-time fight sets this key before the game loads. Never in the
  // save, never in the UI; the Deepwell and Trials keep the real-time fight either way.
  try { if (localStorage.getItem('lanternfall.test.realtime') === '1' && typeof TURN_TUNE === 'object') TURN_TUNE.on = 0; } catch (e) {}
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const box = $('stageBox');
  const heroName = () => { const k = soloHero(); return (k && typeof ROSTER === 'object' && ROSTER[k] && ROSTER[k].name.split(' ')[0]) || S.name || 'You'; };
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
  const stIcon = id => (typeof STATUS_ICONS === 'object' && STATUS_ICONS[id] ? STATUS_ICONS[id]['24'] || STATUS_ICONS[id]['16'] : '');

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
    L.f.replaceChildren(img('tv-img', heroFace(), heroName())); putText(L.n, heroName()); putText(L.h, `Speed ${Math.round(p.heroHaste)}`);
    R.f.replaceChildren(img('tv-img', foeFace(f), fname)); putText(R.n, fname);
    // C25: a foe kind you have not beaten yet keeps its Speed hidden
    const known = !(f && typeof masteryApi === 'object' && masteryApi.typeKills) || masteryApi.typeKills(f.type) >= 1 || f.boss;
    putText(R.h, known ? `Speed ${Math.round(p.foeHaste)}` : 'Speed ?');
    putText(banner, heroFirst ? 'You go first' : `${fname} goes first`);
    card.classList.toggle('foe-first', !heroFirst);
    card.classList.toggle('boss', !!(f && f.boss));
    card.classList.toggle('calm', reduced());
    const secs = typeof TURN_TUNE === 'object' ? TURN_TUNE.introHand : 1.2;
    card.style.setProperty('--tv-dur', secs + 's');
    card.hidden = false; card.classList.remove('play'); void card.offsetWidth; card.classList.add('play');
    cardAt = performance.now();
    clearTimeout(cardT); cardT = setTimeout(() => { card.hidden = true; card.classList.remove('play'); }, secs * 2000);
  });
  on('fightEnd', () => { clearTimeout(cardT); card.hidden = true; });

  // ---- the turn strip, the timing bar, the hero row ----
  const strip = el('div', 'tv-strip'); strip.hidden = true; strip.setAttribute('aria-label', 'Turn order');
  const slots = []; for (let i = 0; i < 6; i++) { const s = el('div', 'tv-slot'); slots.push(s); strip.append(s); }
  const turnN = el('span', 'tv-n');
  const bar = el('div', 'tv-time'), fill = el('i', 'tv-fill'), dz = el('i', 'tv-dodge'), pz = el('i', 'tv-parry');
  bar.append(dz, pz, fill); bar.hidden = true; bar.setAttribute('aria-hidden', 'true');
  const heroRow = el('div', 'tv-hero'), pipsLb = el('span', 'tv-res'), pips = el('span', 'tv-pips'), chips = el('span', 'tv-chips');
  heroRow.append(pipsLb, pips, chips);
  const warn = el('div', 'tv-warn'); warn.hidden = true; warn.setAttribute('role', 'status'); warn.setAttribute('aria-live', 'assertive');
  const wrap = el('div', 'tv-top'); wrap.append(strip, turnN, bar, heroRow, warn);
  if (box) box.append(wrap);
  // a timed ability's ring: it closes on the foe; press the ability (or Attack) again as it meets the inner circle
  const ring = el('div', 'tv-ring'), ringO = el('i', 'tv-ring-o'), ringI = el('i', 'tv-ring-i'), ringT = el('b', 'tv-ring-t', 'Now!');
  ring.append(ringI, ringO, ringT); ring.hidden = true; ring.setAttribute('aria-hidden', 'true');
  if (box) box.append(ring);
  let ringAt = 0, ringClose = 0;
  on('timingRing', p => { ringAt = p.opensAt; ringClose = p.closesAt; ring.hidden = false; ring.classList.remove('done'); putText(ringT, p.n > 1 ? `${p.i + 1} / ${p.n}` : 'Now!'); });
  on('timingGrade', p => {
    ring.classList.add('done');
    emit('float', { txt: p.grade === 'perfect' ? 'PERFECT' : p.grade === 'good' ? 'Good' : 'Miss', color: p.grade === 'perfect' ? '#F2C14E' : p.grade === 'good' ? '#EDE3D1' : '#A9B1BD', big: p.grade === 'perfect', x: 0.66, y: 0.3 });
  });
  const drawRing = s => {
    const on_ = !!(s && s.timing);
    if (!on_) { if (!ring.hidden) ring.hidden = true; return; }
    const u = Math.max(0, Math.min(1, (ringClose - s.now) / Math.max(0.05, ringClose - ringAt)));
    ringO.style.transform = `translate(-50%, -50%) scale(${(1 + 2 * u).toFixed(3)})`;
    ring.classList.toggle('hot', Math.abs(ringClose - s.now) <= (TURN_TUNE.timed ? TURN_TUNE.timed.good : 0.15));
  };

  // warnings: a short banner (a charge stays up while it is gathering)
  let warnT = 0, warnSticky = '';
  const say = (txt, cls, secs) => { putText(warn, txt); warn.className = 'tv-warn ' + (cls || ''); warn.hidden = false; warnT = performance.now() + (secs || 1.6) * 1000; };
  on('foeCharge', p => { warnSticky = p.name; say(`${p.name}! Stun it or hit it hard to break it.`, 'charge', 30); });
  on('chargeBroken', p => { warnSticky = ''; say(`${p.name} is broken!`, 'good', 1.8); emit('float', { txt: 'BROKEN', color: '#F2C14E', big: true }); });
  on('foeMove', p => { if (p && p.charged) { warnSticky = ''; say(`${p.name}: parry or dodge every hit!`, 'charge', 2.5); } });
  on('turnPhase', p => say(`${p.name} is furious and faster!`, 'charge', 2.2));
  on('foeSkip', p => { if (p && p.turn) emit('float', { txt: p.why === 'recover' ? 'Recovering' : p.why === 'freeze' ? 'Frozen' : 'Stunned', color: '#8FB8FF', big: true }); });
  on('foeFrozen', () => emit('float', { txt: 'FROZEN', color: '#8FD8FF', big: true }));
  on('heroMiss', () => emit('float', { txt: 'Miss', color: '#A9B1BD', big: false, x: 0.66, y: 0.42 }));
  on('foeContact', p => { if (p && p.res === 'miss') emit('float', { txt: 'Missed you', color: '#8FB8FF', big: false, x: 0.27, y: 0.42 }); });
  on('fightEnd', () => { warnSticky = ''; warn.hidden = true; });
  on('scrollDrop', p => { if (p && SCROLLS[p.id]) emit('float', { txt: SCROLLS[p.id].name, color: SCROLLS[p.id].col, big: true, x: 0.66, y: 0.24 }); });

  let lastSig = '', winT0 = 0, chipSig = '';
  on('parryWindow', () => { winT0 = 0; });
  function drawHero() {
    const c = typeof turnHeroChips === 'function' ? turnHeroChips() : null;
    if (!c) { if (!heroRow.hidden) heroRow.hidden = true; return; }
    if (heroRow.hidden) heroRow.hidden = false;
    const r = c.res, list = [];
    if (c.guard > 0) list.push(['guard', c.guard]);
    if (c.ward > 0) list.push(['ward', 0]);
    if (c.keen) list.push(['keen', 0]);
    for (const x of c.riders) list.push([x === 'venom' ? 'bleed' : x, 0]);
    const sig = r.name + r.n + '/' + r.max + '|' + list.map(x => x.join(':')).join(',') + '|' + c.last + c.shadow + c.sear;
    if (sig === chipSig) return;
    chipSig = sig;
    putText(pipsLb, r.name);
    pips.replaceChildren(...Array.from({ length: r.max }, (_, i) => el('i', 'tv-pip' + (i < r.n ? ' on' : '') + (r.max > 5 ? ' sm' : ''))));
    pips.setAttribute('aria-label', `${r.name} ${r.n} of ${r.max}`);
    chips.replaceChildren(...list.map(([id, n]) => { const s = el('span', 'tv-chip'); const u = stIcon(id); if (u) s.append(img('tv-chip-ic', u, id)); else s.append(el('b', null, id)); if (n) s.append(el('small', null, String(n))); return s; }),
      ...(c.last > 0 ? [el('span', 'tv-tag', 'Last Stand')] : []), ...(c.shadow > 0 ? [el('span', 'tv-tag', 'Shadow Step')] : []), ...(c.sear ? [el('span', 'tv-tag', 'Searing')] : []));
  }
  function draw() {
    const on_ = typeof turnCombatOn === 'function' && turnCombatOn() && typeof turnCombatSnapshot === 'function';
    const s = on_ ? turnCombatSnapshot() : null, live = !!(s && s.phase !== 'off');
    if (!card.hidden && (!s || s.phase !== 'intro') && performance.now() - cardAt > 250) { card.hidden = true; card.classList.remove('play'); }
    if (wrap.hidden === live) wrap.hidden = !live;
    if (strip.hidden === live) strip.hidden = !live;
    if (!warn.hidden && performance.now() > warnT) warn.hidden = true;
    drawRing(live ? s : null);
    if (!live) { if (!bar.hidden) bar.hidden = true; return; }
    const order = s.order && s.order.length ? s.order : ['hero'];
    const f = foeNow(), sig = order.join() + '|' + (f && f.key) + '|' + s.phase;
    if (sig !== lastSig) {
      lastSig = sig;
      const hf = heroFace(), ff = foeFace(f), now = s.phase === 'hero' || s.phase === 'foeWindup';
      slots.forEach((sl, i) => {
        const o = order[i]; if (!o) { sl.hidden = true; return; }
        sl.hidden = false; sl.className = 'tv-slot ' + o + (i === 0 && now ? ' now' : '');
        sl.replaceChildren(img('tv-mini', o === 'hero' ? hf : ff, o === 'hero' ? heroName() : ((f && f.name) || 'Foe')));
      });
      strip.setAttribute('aria-label', `Turn order: ${order.map(o => o === 'hero' ? 'you' : ((f && f.name) || 'the foe')).join(', then ')}`);
    }
    putText(turnN, s.phase === 'hero' ? 'Your turn' : s.timing ? 'Press again as the ring closes' : s.charge ? `${s.charge} is coming` : s.n ? `Turn ${s.n}` : '');
    turnN.classList.toggle('mine', s.phase === 'hero' || !!s.timing);
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
    drawHero();
  }
  (function loop() { try { draw(); } catch (e) {} requestAnimationFrame(loop); })();

  // ---- the action bar in a turn fight (75-solo-ui asks) ----
  turnBarInfo = () => {
    if (!(typeof turnCombatOn === 'function' && turnCombatOn())) return null;
    const s = turnCombatSnapshot(); if (!s || s.phase === 'off') return null;
    const max = id => (typeof turnCdFor === 'function' ? turnCdFor(id) : 1);
    return { cds: s.cooldowns, max, heroTurn: s.phase === 'hero', windup: s.phase === 'foeWindup', timing: s.timing ? s.timing.id : '',
      why: id => (typeof turnWhyNot === 'function' ? turnWhyNot(id) : '') };
  };
}
