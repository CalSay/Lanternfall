// 75-solo-ui: the solo hero on screen (task SOLO1, docs/design/solo-hero.md). Browser file.
//   - the action bar (owner: like a MOBA ability bar, never over the fight; the lowest thing on the Fight view, right
//     above the tab bar, for the thumbs): two rows of framed square slots.
//       top row     Ability 1, Ability 2, Ability 3   (keys Q, W, E)  the player picks what goes in each slot
//       bottom row  Parry, Dodge, Attack              (keys A, S, D; Space = Dodge, SOLO2)  Attack bottom right
//     Cooldowns sweep dark clockwise with the seconds in the middle and flash when ready; Parry and Dodge glow while a
//     telegraphed hit is coming. A long press on Attack, Parry or Dodge opens a sheet: what it does and its Training; on an ability slot it opens
//     the picker (an empty slot opens it on a tap): that hero's unlocked abilities (icon, name, one line, cooldown),
//     pick one to place it (swapping if it sits in another slot) or clear the slot.
//   - the Auto badge (SOLO2): a small chip at the stage's bottom left, over the DPS line, lit while auto-play fights
//     (idle) and dimmed while you are active. It is a toggle (tap or F); combat presses never flip it. The page hidden
//     fights on Auto while hidden.
//   - "Choose your hero" at camp: the three starters, each with its own level; a free switch.
// Core: 59j-solo.js (soloAttack, soloParry, soloDodge, soloAbility, soloEquip, soloButtons, soloPick, soloLevels).
// Reduced motion: no flashes or pulses (60-solo.css).
// W2-A Training: a long press on Attack, Parry or Dodge opens a small sheet (what it does, its Training level and a Train
// button); on an ability slot the picker shows the slot's ability level and a Train button too. soloIconURL(move) gives
// the bar's icon for a move (the Training list uses it: 'atk' is the hero's weapon).
var soloIconURL = () => '';
{
  const game = $('game');
  document.body.classList.add('solo-on');   // 60-solo.css: the old floating ability circles stay hidden
  const bar = el('div', 'sbar'); bar.id = 'soloBar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Combat');
  bar.hidden = true;
  const rowAb = el('div', 'sb-row sb-row-ab'), rowAct = el('div', 'sb-row sb-row-act');
  bar.append(rowAb, rowAct);
  const INFO = {
    atk: { name: 'Attack', desc: 'Strike the foe in front. A short cooldown, so time it rather than mash it. While you fight by hand, your hero stops attacking alone.', key: 'D' },
    parry: { name: 'Parry', desc: 'Press it just before a heavy hit lands (as the red ring closes). No damage, the foe staggers and you counter. Too early leaves you open for a moment.', key: 'A' },
    dodge: { name: 'Dodge', desc: 'Press it as a heavy hit or a ground attack is about to land. You take no damage. Easier than a parry, but no counter.', key: 'S or Space' }
  };
  const KEY_LB = { atk: 'D', parry: 'A', dodge: 'S', ab0: 'Q', ab1: 'W', ab2: 'E' };   // Space dodges too (the Dodge help says so)
  function mkSlot(row, id, label) {
    const b = el('button', 'sbtn sb-' + id); b.type = 'button'; b.dataset.act = id;
    const ic = el('canvas', 'sb-ic px'), sweep = el('span', 'sb-ring'), n = el('span', 'sb-n'), k = el('span', 'sb-key', KEY_LB[id]), lb = el('span', 'sb-lb', label);
    ic.width = 12; ic.height = 12;
    b.append(ic, sweep, n, k, lb);
    b._ring = sweep; b._n = n; b._ic = ic; b._lb = lb;
    row.append(b);
    return b;
  }
  const bAbs = [0, 1, 2].map(i => { const b = mkSlot(rowAb, 'ab' + i, ''); b.classList.add('sb-abslot'); b.dataset.slot = i; return b; });
  const bParry = mkSlot(rowAct, 'parry', 'Parry'), bDodge = mkSlot(rowAct, 'dodge', 'Dodge'), bAtk = mkSlot(rowAct, 'atk', 'Attack');
  if (game) game.append(bar);   // the last thing on the Fight view: right above the tab bar
  // Owner (SOLO1 layout): what is not combat sits above the stage (Next Up, then Fight / Gather, Switch and the zone
  // arrows); the stage and the bar touch; the bar is the lowest thing above the tab bar. Next Up opens a sheet, so
  // nothing grows under the stage.
  if (game) {
    const box = $('stageBox'), ctrl = game.querySelector(':scope > .ctrl'), nu = $('nuSlot');
    if (box && nu) game.insertBefore(nu, box);
    if (box && ctrl) game.insertBefore(ctrl, box);
    game.classList.add('solo-game');
  }

  // ---- icons (12 x 12 pixel maps, drawn at 2x) ----
  const PAL = { k: '#0B0810', w: '#FFF3C4', s: '#DCE4F0', g: '#7C8290', y: '#F2C14E', o: '#FF9E3D', r: '#E0524F', b: '#8FB8FF', l: '#7ED36A', t: '#C8B89A', n: '#9A6A3E', v: '#B58CFF', m: '#4E4060' };
  const ICON = {
    sword: ['..........kk', '.........ksk', '........ksk.', '.......ksk..', '......ksk...', '.k...ksk....', '.kk.ksk.....', '..kksk......', '...kyk......', '..kyykk.....', '.kyk..kk....', 'kyk.........'],
    bow: ['...nn.......', '..n..n......', '.n....s.....', '.n.....s....', 'n......s....', 'n..kttttsww.', 'n......s....', '.n.....s....', '.n....s.....', '..n..n......', '...nn.......', '............'],
    staff: ['.....oo.....', '....oyyo....', '...oywwyo...', '....oyyo....', '.....oo.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....nn.....', '.....kk.....'],
    parry: ['s.........s.', '.s.......s..', '..s.....s...', '...s...s....', '....sws.....', '.....w......', '....sws.....', '...s...s....', '..y.....y...', '.yy.....yy..', 'y.........y.', '............'],
    dodge: ['............', '.......bbb..', '......bbbbb.', 'bbbb..bbbbb.', '......bbbb..', '.bbbb..bbb..', '.......bb...', '..bbb..bb.bb', '......bbbbbb', '.......bbbb.', '............', '............'],
    echo: ['.......b....', '........b...', '.....b...b..', '......b..b..', 'kk...wsw.b..', 'kttttsssw.b.', 'kk...wsw.b..', '......b..b..', '.....b...b..', '........b...', '.......b....', '............'],
    bash: ['y...kkkkkkk.', '.y.ksssyssk.', '...ksssyssk.', 'yy.kyyyyyyk.', '...ksssyssk.', '.y.ksssyssk.', 'y...ksyysk..', '.....ksyk...', '......kk....', '............', '............', '............'],
    fire: ['.....kk.....', '....koko....', '...kooyok...', '..kooyyok...', '..koyyyook..', '.kooywwyok..', '.koywwwyook.', '.koywwwwyok.', '.kooyywyyok.', '..kooyyook..', '...kooook...', '....kkkk....'],
    empty: ['............', '............', '............', '.....mm.....', '.....mm.....', '...mmmmmm...', '...mmmmmm...', '.....mm.....', '.....mm.....', '............', '............', '............']
  };
  const WEAPON_IC = { wren: 'bow', tobin: 'sword', pip: 'staff' };
  function drawIc(cv, rows) {
    const g = cv.getContext('2d'); g.clearRect(0, 0, 12, 12);
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const c = PAL[r[x]]; if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); } } });
  }
  drawIc(bParry._ic, ICON.parry); drawIc(bDodge._ic, ICON.dodge);
  const icURLs = {};
  soloIconURL = mv => {
    const id = mv === 'atk' ? WEAPON_IC[soloHero()] || 'sword' : mv;
    if (icURLs[id]) return icURLs[id];
    const cv = document.createElement('canvas'); cv.width = 12; cv.height = 12; drawIc(cv, ICON[id] || ICON.fire);
    try { return (icURLs[id] = cv.toDataURL()); } catch (e) { return ''; }
  };
  const abIds = ['?', '?', '?'];
  let heroK = '';

  // ---- feedback ----
  const nope = b => { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); };
  const flash = (b, cls) => { b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls); setTimeout(() => b.classList.remove(cls), 450); };
  // The guide's Dodge and Parry steps pause the game on a heavy hit; the first press there always counts (59j forgive).
  const guideWants = id => { try { return typeof soloGuideWants === 'function' && soloGuideWants() === id; } catch (e) { return false; } };
  const castSlot = i => {
    if (!soloEquipped()[i]) { openPicker(i); return; }
    if (!soloAbility({ slot: i })) nope(bAbs[i]); else flash(bAbs[i], 'good');
  };
  const act = {
    atk: () => { const r = soloAttack(); if (r === 'cd' || !r) nope(bAtk); else flash(bAtk, 'hit'); },
    parry: () => { const r = soloParry(guideWants('parry')); if (r === 'parry') flash(bParry, 'good'); else nope(bParry); },
    dodge: () => { const r = soloDodge(guideWants('dodge')); if (r === 'dodge' || r === 'perfect') flash(bDodge, 'good'); else nope(bDodge); },
    ab0: () => castSlot(0), ab1: () => castSlot(1), ab2: () => castSlot(2)
  };

  // ---- long press on Attack, Parry, Dodge: what it does, and its Training (W2-A) ----
  // A small sheet like the picker (the game waits while it is open; soloPickerOpen covers both).
  const MOVE = { atk: 'atk', parry: 'parry', dodge: 'dodge' };
  function showTip(b) {
    const id = b.dataset.act, i = INFO[id]; if (!i) return;
    closePicker();
    const ov = el('div', 'sp-ov'); ov.id = 'moveSheet'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', i.name);
    const sh = el('div', 'sp-sheet');
    const head = el('div', 'sp-head'); head.append(el('b', null, i.name), el('small', null, `Key: ${i.key}`));
    const x = el('button', 'sp-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.addEventListener('click', closePicker);
    head.append(x);
    sh.append(head, el('p', 'sp-desc', i.desc));
    if (typeof trainCard === 'function' && MOVE[id]) { const c = trainCard(MOVE[id]); c.onLeave = closePicker; sh.append(c); ov._card = c; }
    ov.append(sh);
    ov.addEventListener('pointerdown', e => { if (e.target === ov) closePicker(); });
    ov.addEventListener('keydown', e => { if (e.key === 'Escape') closePicker(); });
    document.body.append(ov); pick = ov;
    (sh.querySelector('.tr-go') || x).focus();
  }

  // ---- the ability picker (a small sheet over the fight; the game waits while it is open) ----
  let pick = null;
  function closePicker() { if (!pick) return; pick.remove(); pick = null; update(); }
  // the open sheet's Training block stays live (gold comes in; the game is paused, so a timer)
  setInterval(() => { try { if (pick && pick._card) pick._card._up(); } catch (e) {} }, 400);
  function openPicker(slot) {
    closePicker();
    const k = soloHero(); if (!k) return;
    const ov = el('div', 'sp-ov'); ov.id = 'abPicker'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', `Ability slot ${slot + 1}`);
    const sh = el('div', 'sp-sheet');
    const head = el('div', 'sp-head'); head.append(el('b', null, `Ability slot ${slot + 1}`), el('small', null, `${ROSTER[k] ? ROSTER[k].name.split(' ')[0] : ''}'s abilities. Pick one for this slot.`));
    const x = el('button', 'sp-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.addEventListener('click', closePicker);
    head.append(x);
    sh.append(head);
    const eq = soloEquipped();
    // W2-A: the slot's ability, its Training level and a Train button
    if (eq[slot] && typeof trainCard === 'function') { const c = trainCard(eq[slot]); c.onLeave = closePicker; sh.append(c); ov._card = c; }
    for (const id of soloAbilities(k)) {
      const a = SOLO_ABILITIES[id], where = eq.indexOf(id);
      const r = el('button', 'sp-ab' + (where === slot ? ' on' : '')); r.type = 'button'; r.dataset.ab = id;
      const cv = el('canvas', 'sp-ic px'); cv.width = 12; cv.height = 12; drawIc(cv, ICON[id] || ICON.fire);
      const t = el('div', 'sp-t'); t.append(el('b', null, a.name), el('span', null, a.line), el('small', null, `Lv ${typeof trainLv === 'function' ? trainLv(id) : 0} · cooldown ${+(typeof trainAbCd === 'function' ? trainAbCd(id, a.cd) : a.cd).toFixed(1)} s` + (where >= 0 ? ` · in slot ${where + 1}` : '')));
      r.append(cv, t);
      r.addEventListener('click', () => { soloEquip(slot, id); try { save(); } catch (e) {} closePicker(); });
      sh.append(r);
    }
    sh.append(el('p', 'note sp-more', 'More abilities come from rare boss drops, later.'));
    const clr = el('button', 'sp-clear', 'Clear this slot'); clr.type = 'button'; clr.disabled = !eq[slot];
    clr.addEventListener('click', () => { soloEquip(slot, null); try { save(); } catch (e) {} closePicker(); });
    sh.append(clr);
    ov.append(sh);
    ov.addEventListener('pointerdown', e => { if (e.target === ov) closePicker(); });
    ov.addEventListener('keydown', e => { if (e.key === 'Escape') closePicker(); });
    document.body.append(ov); pick = ov;
    (sh.querySelector('.sp-ab') || x).focus();
  }
  soloPickerOpen = () => !!pick;

  let press = null;
  for (const b of [...bAbs, bParry, bDodge, bAtk]) {
    const id = b.dataset.act, isAb = id.startsWith('ab');
    b.addEventListener('pointerdown', e => {
      e.stopPropagation();
      press = { b, long: false, t: setTimeout(() => { if (press && press.b === b) { press.long = true; if (isAb) openPicker(+b.dataset.slot); else showTip(b); } }, 550) };
      // Attack, Parry and Dodge act on the press (timing matters); an ability slot waits for the release (a long press picks)
      if (!isAb) act[id]();
    });
    const endPress = () => { if (!press || press.b !== b) return; clearTimeout(press.t); const long = press.long; press = null; if (!long && isAb) act[id](); };
    b.addEventListener('pointerup', endPress);
    b.addEventListener('pointerleave', () => { if (press && press.b === b) { clearTimeout(press.t); press = null; } });
    b.addEventListener('pointercancel', () => { if (press && press.b === b) { clearTimeout(press.t); press = null; } });
    b.addEventListener('contextmenu', e => e.preventDefault());
    b.addEventListener('click', e => { if (e.detail === 0) act[id](); });   // keyboard users: Enter / Space on a focused slot
  }
  const KEYS = { q: 'ab0', w: 'ab1', e: 'ab2', a: 'parry', s: 'dodge', d: 'atk', ' ': 'dodge' };   // SOLO2: Space dodges
  addEventListener('keydown', e => {
    if (bar.hidden || pick || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || (t.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')))) return;
    if (S.tab && !isWide()) return;   // a menu covers the fight (UX-L1: in landscape the bar stays live beside the menu)
    if (e.key.toLowerCase() === 'f') { e.preventDefault(); flipAuto(); return; }   // F: the Auto toggle
    const id = KEYS[e.key.toLowerCase()]; if (!id) return;
    e.preventDefault();
    act[id]();
  });

  // ---- update (about 10 times a second) ----
  // LoL-style: the dark part sweeps clockwise off the icon as the slot comes back (--cd 1 -> 0); a flash when ready.
  const setCd = (b, left, max) => {
    const f = max > 0 ? Math.max(0, Math.min(1, left / max)) : 0, v = f.toFixed(2);
    if (b._cd === v) return;
    const was = b._cd != null && +b._cd > 0;
    b._cd = v; b.style.setProperty('--cd', v); b.classList.toggle('cool', f > 0);
    if (was && f === 0) flash(b, 'ready-now');
  };
  const setN = (b, s) => { if (b._nv !== s) { b._nv = s; b._n.textContent = s; } };
  const secs = x => (x > 0 ? (x < 1 ? x.toFixed(1).replace(/^0/, '') : String(Math.ceil(x))) : '');
  // ---- the Auto button (owner 2026-09-30): a toggle, lit while Auto fights for you. Only a tap or F changes it ----
  const badge = el('button', 'auto-badge'); badge.id = 'autoBadge'; badge.type = 'button'; badge.hidden = true;
  badge.append(el('i', 'ab-dot'), el('span', null, 'Auto'));
  const hud = $('stageBox') && $('stageBox').querySelector('.hud');
  if (hud) hud.append(badge);
  const flipAuto = () => { soloSetAuto(!soloAuto()); setBadge(); };
  ['pointerdown', 'pointerup', 'touchstart'].forEach(ev => badge.addEventListener(ev, e => e.stopPropagation(), { passive: true }));
  badge.addEventListener('click', e => { e.stopPropagation(); flipAuto(); });
  const setBadge = () => {
    const on_ = !soloActive();
    if (badge._on === on_) return;
    badge._on = on_; badge.classList.toggle('on', on_);
    badge.setAttribute('aria-pressed', String(soloAuto()));
    badge.setAttribute('aria-label', soloAuto() ? 'Auto is on: your hero fights alone. Turn it off' : 'Auto is off: you are fighting. Turn it on');
    badge.title = soloAuto() ? 'Auto is on: your hero fights alone. Tap to turn it off and fight by hand. (F)' : 'Auto is off: you are fighting. Tap to turn Auto on. (F)';
  };
  on('soloActive', setBadge);
  // the page hidden or the app in the background: Auto fights while it is hidden; back on screen, your setting returns
  const vis = () => { try { if (document.hidden) soloGoIdle(); else soloWake(); } catch (e) {} };
  document.addEventListener('visibilitychange', vis);
  addEventListener('pagehide', () => { try { soloGoIdle(); } catch (e) {} });
  addEventListener('pageshow', () => { try { if (!document.hidden) soloWake(); } catch (e) {} });

  let t = 0;
  function update() {
    const show = !!soloHero() && target() === 'mob' && !!(S.party && S.party.chosen);
    if (bar.hidden === show) { bar.hidden = !show; if (!show) closePicker(); }
    if (badge.hidden === show) badge.hidden = !show;
    if (!show) return;
    setBadge();
    const s = soloButtons(), k = soloHero();
    if (k !== heroK) { heroK = k; drawIc(bAtk._ic, ICON[WEAPON_IC[k]] || ICON.sword); }
    for (let i = 0; i < 3; i++) {
      const o = s.abs[i], b = bAbs[i];
      if (o.id !== abIds[i]) {
        abIds[i] = o.id; drawIc(b._ic, o.id ? ICON[o.id] || ICON.fire : ICON.empty); putText(b._lb, o.id ? (SOLO_ABILITIES[o.id].short || o.name) : 'Empty');
        b.classList.toggle('empty', !o.id);
        const a = o.id ? SOLO_ABILITIES[o.id] : null;
        b.setAttribute('aria-label', a ? `${a.name} (${KEY_LB['ab' + i]}). ${a.desc} Hold to change the slot.` : `Empty ability slot ${i + 1} (${KEY_LB['ab' + i]}). Tap to choose an ability.`);
      }
      setCd(b, o.left, o.max); setN(b, secs(o.left));
      b.classList.toggle('ready', !!o.id && o.ready);
    }
    setCd(bAtk, s.atk.left, s.atk.max);
    setCd(bParry, s.parry.left, s.parry.max);
    setCd(bDodge, s.dodge.left, s.dodge.max);
    setN(bDodge, secs(s.dodge.left)); setN(bParry, s.parry.open > 0 ? '!' : '');
    bParry.classList.toggle('open', s.parry.open > 0);
    // disabled: nothing to hit right now (between packs, the hero down)
    const idle = !s.fight;
    for (const b of [bAtk, bParry, bDodge, ...bAbs]) if (b.classList.contains('off') !== idle) b.classList.toggle('off', idle);
    // a telegraphed hit is coming: Parry and Dodge glow (the stage ring shows when)
    bParry.classList.toggle('live', s.tele === 'heavy');
    bDodge.classList.toggle('live', s.tele === 'heavy' || s.tele === 'zone' || s.tele === 'slam');
  }
  bAtk.setAttribute('aria-label', 'Attack (D). ' + INFO.atk.desc);
  bParry.setAttribute('aria-label', 'Parry (A). ' + INFO.parry.desc);
  bDodge.setAttribute('aria-label', 'Dodge (S or Space). ' + INFO.dodge.desc);
  onTick(dt => { t += dt; if (t < 0.08) return; t = 0; try { update(); } catch (e) { console.error('[lanternfall] solo bar', e); } });
  // the paused game (the guide, the picker) does not tick: keep the bar fresh anyway
  setInterval(() => { try { update(); } catch (e) {} }, 250);

  // ---- floats for the answers (the stage draws them; a parry's PARRY is the stage's own, 62-stage) ----
  on('soloParry', ({ res }) => { if (res === 'miss') emit('float', { txt: 'Open!', color: '#E0524F', big: false, x: 0.27, y: 0.42 }); });
  on('soloDodge', ({ res }) => { if (res === 'dodge' || res === 'perfect') emit('float', { txt: res === 'perfect' ? 'Perfect dodge' : 'Dodged', color: '#8FB8FF', big: true, x: 0.27, y: 0.4 }); else if (res === 'early') emit('float', { txt: 'Too early', color: '#A9B1BD', big: false, x: 0.27, y: 0.42 }); });

  // ---- "Choose your hero" at camp ----
  registerSection('camp', {
    id: 'solo-hero', title: 'Choose your hero',
    mount(sec) {
      sec.classList.add('solo-pick');
      if (sec.parentNode) sec.parentNode.prepend(sec);   // first on the Camp view
      const note = el('p', 'note', 'Switch any time, for free. Gold, gear and camp are shared. Each hero keeps their own level.');
      const row = el('div', 'sp-row');
      sec.append(note, row);
      sec._cards = SOLO_ORDER.map(k => {
        const h = SOLO_HEROES[k], R = ROSTER[k];
        const b = el('button', 'sp-card'); b.type = 'button'; b.dataset.hero = k;
        const cv = el('canvas', 'sp-fig px'); cv.width = 56; cv.height = 80;
        const nm = el('b', null, R ? R.name.split(' ')[0] : k), sub = el('small', null, `${h.role} · ${h.weapon}`), lv = el('span', 'sp-lv', 'Lv 1');
        b.append(cv, nm, sub, lv);
        b._lv = lv; b._cv = cv;
        b.addEventListener('click', () => {
          if (soloHero() === k) return;
          if (b.dataset.armed !== '1') { for (const c of sec._cards) c.dataset.armed = ''; b.dataset.armed = '1'; putText(b._lv, 'Tap again'); return; }
          b.dataset.armed = '';
          if (soloPick(k)) { try { save(); } catch (e) {} ui(true); if (typeof updatePortrait === 'function') updatePortrait(); }
          sec._up(true);
        });
        row.append(b);
        return b;
      });
      requestAnimationFrame(() => { for (const b of sec._cards) { try { const x = b._cv.getContext('2d'); x.imageSmoothingEnabled = false; if (!(typeof heroArtPreview === 'function' && heroArtPreview(b._cv, b.dataset.hero))) drawCharPreview(b._cv, companionSpec(b.dataset.hero), 1); } catch (e) {} } });
      sec._up = () => {
        const lv = soloLevels(), cur = soloHero();
        for (const b of sec._cards) {
          const k = b.dataset.hero, on_ = k === cur;
          b.setAttribute('aria-pressed', on_ ? 'true' : 'false');
          b.classList.toggle('on', on_);
          if (b.dataset.armed !== '1') putText(b._lv, on_ ? `Lv ${lv[k].L} · Playing` : `Lv ${lv[k].L}`);
        }
      };
    },
    update() { const s = $('sec-solo-hero'); if (s && s._up) s._up(); }
  });
}
