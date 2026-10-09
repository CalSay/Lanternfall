// 75-solo-ui: the solo hero on screen (task SOLO1, docs/design/solo-hero.md). Browser file.
//   - the action bar, now the dock under the stage (Combat C "Stage and dock", Cal 2026-10-05; the lowest thing on the
//     Fight view, right above the tab bar, for the thumbs): tabs Act / Skills / Foe, one pane, and Parry and Dodge under
//     it on every tab.
//       Act pane    Attack, Ability 1, Ability 2, Ability 3   (keys D, Q, W, E)  the player picks what goes in each slot
//       under it    Parry, Dodge                              (keys A, S; Space = Dodge, SOLO2)
//       Skills      what each slot does and its cooldown; a tap changes the slot.  Foe  (turn fights) its kind, trait, moves.
//     Cooldowns sweep dark clockwise with the seconds in the middle and flash when ready; Parry and Dodge glow while a
//     telegraphed hit is coming. A long press on Attack, Parry or Dodge opens a sheet: what it does and its Training (or, with attributes on, its number from your level and an Attributes button); on an ability slot it opens
//     the picker (an empty slot opens it on a tap): that hero's unlocked abilities (icon, name, one line, cooldown),
//     pick one to place it (swapping if it sits in another slot) or clear the slot.
//   - the Auto badge (SOLO2): a small chip at the stage's bottom left, over the DPS line, lit while auto-play fights
//     (idle) and dimmed while you are active. It is a toggle (tap or F); combat presses never flip it. The page hidden
//     fights on Auto while hidden.
//   - "Choose your hero" at camp: the three starters, each with its own level; a free switch.
// Core: 59j-solo.js (soloAttack, soloParry, soloDodge, soloAbility, soloEquip, soloButtons, soloPick, soloLevels).
// Reduced motion: no flashes or pulses (60-solo.css).
// W2-A Training: a long press on Attack, Parry or Dodge opens a small sheet (what it does, its Training level and a Train
// button); on an ability slot the picker shows the slot's ability level and a Train button too. hero-progression-rework: with
// attributes on (attrOn()) there is no Train button or Training level: the block reads "from your level" and opens the
// Attributes view (75-training-ui trainCard). soloIconURL(move) gives
// the bar's icon for a move (the Training list uses it: 'atk' is the hero's weapon).
var soloIconURL = () => '';
{
  const game = $('game');
  document.body.classList.add('solo-on');   // 60-solo.css: the old floating ability circles stay hidden
  const bar = el('div', 'sbar'); bar.id = 'soloBar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Combat');
  bar.hidden = true;
  // Stage and dock (Combat C, Cal 2026-10-05): tabs (Act, Skills, Foe), one pane under them, and Parry and Dodge below,
  // on screen whichever tab is open so a heavy hit can still be answered while you read the foe.
  const tabRow = el('div', 'sb-tabs'), pane = el('div', 'sb-pane');
  const rowAb = el('div', 'sb-row sb-row-ab'), rowAct = el('div', 'sb-row sb-row-act');
  const paneAct = el('div', 'sb-p sb-p-act'), paneSk = el('div', 'sb-p sb-p-sk'), paneFoe = el('div', 'sb-p sb-p-foe');
  paneAct.append(rowAb); pane.append(paneAct, paneSk, paneFoe);
  tabRow.setAttribute('role', 'tablist'); tabRow.setAttribute('aria-label', 'Fight panels');
  bar.append(tabRow, pane, rowAct);
  const INFO = {
    atk: { name: 'Attack', desc: 'Strike the foe in front. A short cooldown, so time it rather than mash it. While you fight by hand, your hero stops attacking alone.', key: 'D' },
    parry: { name: 'Parry', desc: 'Press it just before a heavy hit lands (as the red ring closes). No damage, the foe staggers and you counter. Too early leaves you open for a moment.', key: 'A' },
    dodge: { name: 'Dodge', desc: 'Press it as a heavy hit or a ground attack is about to land. You take no damage. Easier than a parry, but no counter.', key: 'S or Space' }
  };
  const KEY_LB = { atk: 'D', parry: 'A', dodge: 'S', ab0: 'Q', ab1: 'W', ab2: 'E' };   // Space dodges too (the Dodge help says so)
  function mkSlot(row, id, label) {
    const b = el('button', 'sbtn sb-' + id); b.type = 'button'; b.dataset.act = id;
    const ic = el('canvas', 'sb-ic px'), sweep = el('span', 'sb-ring'), n = el('span', 'sb-n'), k = el('span', 'sb-key', KEY_LB[id]), lb = el('span', 'sb-lb', label), sub = el('span', 'sb-sub');
    ic.width = 12; ic.height = 12;
    const tx = el('span', 'sb-tx'); tx.append(lb, sub);
    b.append(ic, sweep, n, k, tx);
    b._ring = sweep; b._n = n; b._ic = ic; b._lb = lb; b._sub = sub;
    row.append(b);
    return b;
  }
  // the dock's Act pane: Attack, then the three ability slots (keys D, Q, W, E); Parry and Dodge sit under it
  const bAtk = mkSlot(rowAb, 'atk', 'Attack');
  const bAbs = [0, 1, 2].map(i => { const b = mkSlot(rowAb, 'ab' + i, ''); b.classList.add('sb-abslot'); b.dataset.slot = i; return b; });
  // ability-names-fit: a long name steps its size down to its tile's width when a fallback font draws it (fitTextWidth, 75-abilities-ui)
  const fitLb = lb => fitTextWidth(lb);
  const fitAbs = () => fitTextWidths(bAbs.flatMap(b => [b._lb, b._sub]));
  if (typeof ResizeObserver === 'function') { const ro = new ResizeObserver(fitAbs); bAbs.forEach(b => ro.observe(b)); }
  try { document.fonts.addEventListener('loadingdone', fitAbs); } catch (e) {}
  const bParry = mkSlot(rowAct, 'parry', 'Parry'), bDodge = mkSlot(rowAct, 'dodge', 'Dodge');
  bParry.classList.add('sb-def'); bDodge.classList.add('sb-def');
  putText(bParry._sub, 'Hard · counters'); putText(bDodge._sub, 'Easy · evades');
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
    if (cv.width !== 12) { cv.width = 12; cv.height = 12; }
    const g = cv.getContext('2d'); g.clearRect(0, 0, 12, 12);
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const c = PAL[r[x]]; if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); } } });
  }
  // C26: the approved action icons (ACTION_ICONS, 60n-nicons) at the size the bar shows; the pixel maps above stay
  // as the fallback for a move the pack has no icon for. Attack is the hero's own ('attack-wren', ...).
  const packId = mv => mv === 'atk' ? 'attack-' + (soloHero() || 'tobin') : mv;
  // an ability learned for turn fights (24c) has no icon in the pack (Wren and Tobin until their packs are whole): its slot shows a plain lettered tile
  const noIcon = mv => mv !== 'atk' && !ICON[mv] && !nicHas('act', packId(mv));
  const setIc = (cv, mv, px) => {
    const b = cv.parentElement, mono = noIcon(mv);
    if (b) { b.classList.toggle('mono', mono); if (mono) b.dataset.mono = monoOf(mv); else delete b.dataset.mono; }
    if (mono) { const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); return; }
    if (!nicSet(cv, 'act', packId(mv), px)) drawIc(cv, ICON[mv === 'atk' ? WEAPON_IC[soloHero()] || 'sword' : mv] || ICON.fire);
  };
  const monoOf = id => { const a = SOLO_ABILITIES[id]; const n = (a && (a.short || a.name)) || '?'; return n.slice(0, 2); };
  setIc(bParry._ic, 'parry', 48); setIc(bDodge._ic, 'dodge', 48);
  const icURLs = {};
  soloIconURL = mv => {
    const u = nicURL('act', packId(mv), 48); if (u) return u;
    if (noIcon(mv)) return '';
    const id = mv === 'atk' ? WEAPON_IC[soloHero()] || 'sword' : mv;
    if (icURLs[id]) return icURLs[id];
    const cv = document.createElement('canvas'); cv.width = 12; cv.height = 12; drawIc(cv, ICON[id] || ICON.fire);
    try { return (icURLs[id] = cv.toDataURL()); } catch (e) { return ''; }
  };
  const abIds = ['?', '?', '?'];
  let heroK = '';

  // ---- feedback ----
  // fight-input-during-banner: beside the shake, a short red-brown outline that is not an animation, so reduced motion keeps it
  const nope = b => {
    b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
    b.classList.add('refused'); clearTimeout(b._refT); b._refT = setTimeout(() => b.classList.remove('refused'), 250);
  };
  const flash = (b, cls) => { b.classList.remove(cls); void b.offsetWidth; b.classList.add(cls); setTimeout(() => b.classList.remove(cls), 450); };
  // The guide's Dodge and Parry steps pause the game on a heavy hit; the first press there always counts (59j forgive).
  const guideWants = id => { try { return typeof soloGuideWants === 'function' && soloGuideWants() === id; } catch (e) { return false; } };
  // cal-0107-staged-guide (Cal's play note 4): an empty slot with nothing to put in it (every move you own already has a slot) is dim and
  // silent: no "Tap to add", no picker. It stays in place (the six-slot bar), and wakes once a learned move is waiting for a slot.
  const slotShut = i => { try { const eq = soloEquipped(); return !eq[i] && !soloAbilities().some(id => !eq.includes(id)); } catch (e) { return false; } };
  const castSlot = i => {
    if (slotShut(i)) return;
    if (!soloEquipped()[i]) { openPicker(i); return; }
    const pa = typeof ABILITIES === 'object' && ABILITIES[soloEquipped()[i]];
    if (pa && pa.kind === 'passive') { nope(bAbs[i]); return; }   // always on: no button to press
    if (!soloAbility({ slot: i })) nope(bAbs[i]); else flash(bAbs[i], 'good');
  };
  // cal-0107-staged-guide: while a fight lesson holds the game, only the button it names acts (the ability lesson: any ability slot), so
  // a press on another button cannot end the lesson out of order (the walk's bot cast its ability through the Attack lesson)
  const LESSON_ACT = { attack: /^atk$/, ability: /^ab\d$/, dodge: /^dodge$/, parry: /^parry$/ };
  const lessonBlocks = id => { try { const w = ONBOARD.paused && soloGuideWants(); return !!(w && LESSON_ACT[w] && !LESSON_ACT[w].test(id)); } catch (e) { return false; } };
  const act0 = {
    atk: () => { const r = soloAttack(); if (r === 'cd' || !r) nope(bAtk); else flash(bAtk, 'hit'); },
    parry: () => { const r = soloParry(guideWants('parry')); if (r === 'parry') flash(bParry, 'good'); else nope(bParry); },
    dodge: () => { const r = soloDodge(guideWants('dodge')); if (r === 'dodge' || r === 'perfect') flash(bDodge, 'good'); else nope(bDodge); },
    ab0: () => castSlot(0), ab1: () => castSlot(1), ab2: () => castSlot(2)
  };
  const actBtn = { atk: () => bAtk, parry: () => bParry, dodge: () => bDodge, ab0: () => bAbs[0], ab1: () => bAbs[1], ab2: () => bAbs[2] };
  const act = {};
  for (const id in act0) act[id] = () => { if (lessonBlocks(id)) { nope(actBtn[id]()); return; } act0[id](); };

  // ---- long press on Attack, Parry, Dodge: what it does, and its Training or level (W2-A) ----
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
    const own = id === 'dodge' && typeof turnDodgeLine === 'function' && typeof soloHero === 'function' ? turnDodgeLine(soloHero()) : '';
    if (own) sh.append(el('p', 'sp-desc', own));   // Wren's Out of Reach (59k)
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
  // the open sheet's Training block stays live (gold comes in, points move; the game is paused, so a timer)
  setInterval(() => { try { if (pick && pick._card) pick._card._up(); } catch (e) {} }, 400);
  function openPicker(slot) {
    closePicker();
    const k = soloHero(); if (!k || slotShut(slot)) return;
    const ov = el('div', 'sp-ov'); ov.id = 'abPicker'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', `Ability slot ${slot + 1}`);
    const sh = el('div', 'sp-sheet');
    const head = el('div', 'sp-head'); head.append(el('b', null, `Ability slot ${slot + 1}`), el('small', null, `${ROSTER[k] ? ROSTER[k].name.split(' ')[0] : ''}'s abilities. Pick one for this slot.`));
    const x = el('button', 'sp-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.addEventListener('click', closePicker);
    head.append(x);
    sh.append(head);
    const eq = soloEquipped();
    // W2-A: the slot's ability, its Training level and a Train button (attributes on: its level-based power and Attributes)
    const sig = SOLO_HEROES[k] && SOLO_HEROES[k].abs[0];   // its Training is the hero's ability power (59k)
    if (eq[slot] && eq[slot] === sig && typeof trainCard === 'function') { const c = trainCard(eq[slot]); c.onLeave = closePicker; sh.append(c); ov._card = c; }
    for (const id of soloAbilities(k)) {
      const a = SOLO_ABILITIES[id], where = eq.indexOf(id);
      const r = el('button', 'sp-ab' + (where === slot ? ' on' : '')); r.type = 'button'; r.dataset.ab = id;
      let cv; if (noIcon(id)) cv = el('span', 'sp-mono', monoOf(id)); else { cv = el('canvas', 'sp-ic px'); cv.width = 12; cv.height = 12; setIc(cv, id, 36); }
      const b = typeof ABILITIES === 'object' && ABILITIES[id];
      const cdTxt = b ? (b.kind === 'passive' ? 'Passive' : `Cooldown ${typeof turnCdFor === 'function' ? turnCdFor(id) : b.cd} turns`) : `cooldown ${+(typeof trainAbCd === 'function' ? trainAbCd(id, a.cd) : a.cd).toFixed(1)} s`;
      const t = el('div', 'sp-t'); t.append(el('b', null, a.name), el('span', null, a.line), el('small', null, cdTxt + (where >= 0 ? ` · in slot ${where + 1}` : '')));
      r.append(cv, t);
      r.addEventListener('click', () => { soloEquip(slot, id); try { save(); } catch (e) {} closePicker(); });
      sh.append(r);
    }
    sh.append(el('p', 'note sp-more', 'Learn more on the Hero tab, under Abilities. Zone bosses drop the Scrolls that teach them.'));
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
    if (bar.hidden || pick || gameHeld() || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    // space-reopens-next-up: a clicked button keeps focus (a sheet hands it back on close) and the browser presses it on Space, so
    // Space in a fight is the dodge, not a press of that button. The bar's own tiles still take Space and Enter as a click; Enter on
    // any other focused button still presses it, and so does Space on a button in a sheet or card open over the fight or in the
    // menu open beside it (wide views: a keyboard player working the Hero or Craft menu).
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable || (t.tagName === 'BUTTON' && (e.key === 'Enter' || (e.key === ' ' && (bar.contains(t) || t.closest(MODAL_UP) || (S.tab && t.closest('#menu')))))))) return;
    if (S.tab && !isWide()) return;   // a menu covers the fight (UX-L1: in landscape the bar stays live beside the menu)
    if (e.key.toLowerCase() === 'f') { if (typeof turnCombatOn === 'function' && turnCombatOn()) return; e.preventDefault(); flipAuto(); return; }   // F: the Auto toggle (no Auto in turn fights)
    const id = KEYS[e.key.toLowerCase()]; if (!id) return;
    e.preventDefault();
    act[id]();
  });

  // ---- update (about 10 times a second) ----
  // LoL-style: the dark part sweeps clockwise off the icon as the slot comes back (--cd 1 -> 0); a flash when ready.
  // quiet: the hero cannot act yet (the turn banner, the VS card), so no ready flash; it is not replayed later
  const setCd = (b, left, max, quiet) => {
    const f = max > 0 ? Math.max(0, Math.min(1, left / max)) : 0, v = f.toFixed(2);
    if (b._cd === v) return;
    const was = b._cd != null && +b._cd > 0;
    b._cd = v; b.style.setProperty('--cd', v); b.classList.toggle('cool', f > 0);
    if (was && f === 0 && !quiet) flash(b, 'ready-now');
  };
  const setN = (b, s) => { if (b._nv !== s) { b._nv = s; b._n.textContent = s; } };
  const secs = x => (x > 0 ? (x < 1 ? x.toFixed(1).replace(/^0/, '') : String(Math.ceil(x))) : '');
  // ---- the Auto button (owner 2026-09-30): a toggle, lit while Auto fights for you. Only a tap or F changes it ----
  const badge = el('button', 'auto-badge'); badge.id = 'autoBadge'; badge.type = 'button'; badge.hidden = true;
  // C26: the approved Auto on / off icons (16 px); the dot is the fallback
  const abIc = nicHas('act', 'auto-on') ? el('img', 'ab-ic') : el('i', 'ab-dot'); abIc.alt = '';
  badge.append(abIc, el('span', null, 'Auto'));
  const hud = $('stageBox') && $('stageBox').querySelector('.hud');
  if (hud) hud.append(badge);
  const flipAuto = () => { soloSetAuto(!soloAuto()); setBadge(); };
  ['pointerdown', 'pointerup', 'touchstart'].forEach(ev => badge.addEventListener(ev, e => e.stopPropagation(), { passive: true }));
  badge.addEventListener('click', e => { e.stopPropagation(); flipAuto(); });
  const setBadge = () => {
    const on_ = !soloActive();
    if (badge._on === on_) return;
    badge._on = on_; badge.classList.toggle('on', on_);
    if (abIc.tagName === 'IMG') nicSet(abIc, 'act', on_ ? 'auto-on' : 'auto-off', 16);
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


  // ---- the dock's tabs: Act (the buttons), Skills (what each slot does), Foe (what you face; turn fights only) ----
  const TABS = [['act', 'Act', paneAct], ['sk', 'Skills', paneSk], ['foe', 'Foe', paneFoe]];
  let dockTab = 'act';
  const tabBtn = {};
  for (const [id, label] of TABS) {
    const b = el('button', 'sb-tab', label); b.type = 'button'; b.dataset.tab = id; b.setAttribute('role', 'tab');
    ['pointerdown', 'pointerup'].forEach(ev => b.addEventListener(ev, e => e.stopPropagation()));
    b.addEventListener('click', () => setTab(id));
    tabBtn[id] = b; tabRow.append(b);
  }
  function setTab(id) {
    if (!tabBtn[id] || tabBtn[id].hidden) id = 'act';
    dockTab = id;
    // desktop-layout-v1 (desk playtest F08): on a desktop screen Foe opens above the buttons, so you still see your moves land
    const both = id === 'foe' && typeof isDesk === 'function' && isDesk();
    for (const [k, , p] of TABS) { tabBtn[k].setAttribute('aria-selected', String(k === id)); p.hidden = k !== id && !(both && k === 'act'); }
    pane.classList.toggle('with-foe', both);
    skSig = foeSig = ''; if (!bar.hidden) { try { fillSkills(); fillFoe(); } catch (e) {} }
  }
  // Skills: one row per slot (tap one to change what it holds, as a long press does)
  const skRows = [0, 1, 2].map(i => {
    const r = el('button', 'sb-sk'); r.type = 'button'; r.dataset.slot = i;
    const ic = el('canvas', 'sb-sk-ic px'); ic.width = 12; ic.height = 12;
    const nm = el('b', 'sb-sk-nm'), ds = el('span', 'sb-sk-ds'), chip = el('span', 'sb-sk-chip'), tx = el('span', 'sb-sk-tx');
    tx.append(nm, ds); r.append(ic, tx, chip); r._ic = ic; r._nm = nm; r._ds = ds; r._chip = chip;
    ['pointerdown', 'pointerup'].forEach(ev => r.addEventListener(ev, e => e.stopPropagation()));
    r.addEventListener('click', () => openPicker(i));
    paneSk.append(r);
    return r;
  });
  let skSig = '', foeSig = '';
  const turnsTxt = n => `${n} turn${n > 1 ? 's' : ''}`;
  // ability-names-fit: under a blocked slot, just what it needs ("Burn", "Parry first", "3 Cinders"): "Needs a Burn" cut to "Needs ..." in
  // the 64 px desktop slot. The red "!" says it is blocked; the hover tip keeps the whole "Needs a Burn" (b._why).
  const needTxt = why => { const t = why.slice(5).replace(/^a /, ''); return t.charAt(0).toUpperCase() + t.slice(1); };
  function fillSkills() {
    if (dockTab !== 'sk') return;
    const s = soloButtons(), tb = typeof turnBarInfo === 'function' ? turnBarInfo() : null;
    const sig = s.abs.map((o, i) => o.id + ':' + (tb ? (tb.cds[o.id] || 0) + tb.why(o.id) : o.left > 0 ? 'c' : '')).join('|') + heroK;
    if (sig === skSig) return; skSig = sig;
    skRows.forEach((r, i) => {
      const o = s.abs[i], a = o.id ? SOLO_ABILITIES[o.id] : null, pa = o.id && typeof ABILITIES === 'object' ? ABILITIES[o.id] : null;
      r.classList.toggle('empty', !a); r.classList.toggle('passive', !!(pa && pa.kind === 'passive'));
      if (!a) { putText(r._nm, 'Empty slot ' + (i + 1)); putText(r._ds, 'Choose an ability for it.'); putText(r._chip, ''); setIc(r._ic, 'empty', 24); return; }
      setIc(r._ic, o.id, 24);
      putText(r._nm, a.name); putText(r._ds, a.turnDesc || a.line || a.desc || '');
      const cd = tb ? tb.cds[o.id] || 0 : 0;
      putText(r._chip, pa && pa.kind === 'passive' ? 'Passive' : tb ? (cd ? turnsTxt(cd) : 'Ready') : o.left > 0 ? secs(o.left) + ' s' : 'Ready');
    });
  }
  // Foe: its name and kind, its trait when it has one, and the moves you have learned (75-turn-ui turnFoeInfo)
  const foeRow = (k, ...kids) => { const r = el('div', 'sb-fr'); r.append(el('span', 'sb-fk', k)); const v = el('span', 'sb-fv'); v.append(...kids); r.append(v); return r; };
  function fillFoe() {
    if (dockTab !== 'foe') return;
    const f = typeof turnFoeInfo === 'function' ? turnFoeInfo() : null;
    const sig = f ? JSON.stringify(f) : '';
    if (sig === foeSig) return; foeSig = sig;
    if (!f) { paneFoe.replaceChildren(el('p', 'sb-fnote', 'Foes show here in a turn fight.')); return; }
    const rows = [foeRow('Foe', el('b', 'sb-fname', f.name), ...f.tags.map(x => el('span', 'sb-chip', x)))];
    if (f.trait) rows.push(foeRow('Trait', el('span', 'sb-ftxt', f.trait)));
    (f.learn || []).forEach(l => rows.push(foeRow(l[0], el('span', 'sb-ftxt', l[1]))));
    rows.push(foeRow('Moves', ...(f.known ? f.moves.map(m => el('span', 'sb-chip' + (m.charged ? ' charged' : ''), `${m.name} · ${m.hits} hit${m.hits > 1 ? 's' : ''}${m.charged ? ' · charged' : ''}${m.tricks ? ' · ' + m.tricks : ''}`)) : [el('span', 'sb-ftxt', 'Beat one of these to learn its moves.')]),
      ...(f.hidden > 0 ? [el('span', 'sb-ftxt', `${f.hidden} unknown. Each try you lose shows one more.`)] : [])));
    paneFoe.replaceChildren(...rows);
  }
  setTab('act');
  if (typeof deskMQ === 'object') deskMQ.addEventListener('change', () => setTab(dockTab));

  let t = 0;
  function update() {
    const show = !!soloHero() && target() === 'mob' && !!(S.party && S.party.chosen);
    if (bar.hidden === show) { bar.hidden = !show; if (!show) closePicker(); }
    const showBadge = show && !(typeof turnCombatOn === 'function' && turnCombatOn());   // turn fights are active only: no Auto
    if (badge.hidden === showBadge) badge.hidden = !showBadge;
    if (!show) return;
    setBadge();
    const s = soloButtons(), k = soloHero();
    const turnOn = typeof turnBarInfo === 'function' && !!turnBarInfo();
    if (tabBtn.foe.hidden === turnOn) { tabBtn.foe.hidden = !turnOn; if (!turnOn && dockTab === 'foe') setTab('act'); }
    // the guide points at Act's buttons: keep that pane open until it is done
    if (dockTab !== 'act' && typeof onboardStep === 'function' && onboardStep()) setTab('act');
    if (k !== heroK) { heroK = k; setIc(bAtk._ic, 'atk', 48); }
    // C20 turn fights (75-turn-ui): cooldowns count in turns; hero actions only on the hero's turn, defence on the foe's wind-up
    const tb = typeof turnBarInfo === 'function' ? turnBarInfo() : null;
    // fight-input-during-banner: the banner, the VS card, recovery, the foe's turn and the gap after a kill refuse a hero press, so
    // Attack and the abilities say so (dim, a dull frame, "Wait"); the engine still decides (59k turnResolve)
    const wait = typeof turnCombatOn === 'function' && !!turnCombatOn() && (!tb || (!tb.heroTurn && !tb.timing));
    for (let i = 0; i < 3; i++) {
      const o = s.abs[i], b = bAbs[i];
      if (o.id !== abIds[i]) {
        abIds[i] = o.id; setIc(b._ic, o.id || 'empty', 48); putText(b._lb, o.id ? (SOLO_ABILITIES[o.id].short || o.name) : 'Empty'); fitLb(b._lb);
        b.classList.toggle('empty', !o.id);
        const a = o.id ? SOLO_ABILITIES[o.id] : null, pa = o.id && typeof ABILITIES === 'object' ? ABILITIES[o.id] : null;
        b.classList.toggle('passive', !!(pa && pa.kind === 'passive'));
        b.setAttribute('aria-label', a ? `${a.name} (${KEY_LB['ab' + i]}). ${a.turnDesc || a.desc} Hold to change the slot.` : `Empty ability slot ${i + 1} (${KEY_LB['ab' + i]}). Choose an ability for it.`);
      }
      setCd(b, o.left, o.max, wait); setN(b, secs(o.left));
      b.classList.toggle('ready', !!o.id && o.ready);
      const shut = slotShut(i), sk = (o.id || '') + ':' + shut;
      if (b._shut !== sk) {
        b._shut = sk; putStyle(b, 'opacity', shut ? '0.45' : ''); b.setAttribute('aria-disabled', String(shut));
        if (!o.id) b.setAttribute('aria-label', shut ? `Empty ability slot ${i + 1}. Learn another move to use it.` : `Empty ability slot ${i + 1} (${KEY_LB['ab' + i]}). Choose an ability for it.`);
      }
      putText(b._sub, !o.id ? (shut ? '' : 'Tap to add') : o.left > 0 ? '' : wait ? 'Wait' : 'Ready');
    }
    putText(bAtk._sub, '');
    setCd(bAtk, s.atk.left, s.atk.max, wait);
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
    if (tb) {
      for (let i = 0; i < 3; i++) {
        const o = s.abs[i], b = bAbs[i]; if (!o.id) continue;
        const cd = tb.cds[o.id] || 0, why = tb.why(o.id), pas = why === 'passive';
        setCd(b, pas ? 0 : cd, tb.max(o.id), wait);
        // why it cannot be used: its cooldown (turns), the finisher's third turn, or what it needs (a Burn, Grit, ...)
        setN(b, pas ? '' : cd ? String(cd) : why === 'gate' ? 'T3' : why && why !== 'cd' && why !== 'turn' ? '!' : '');
        b._why = why.startsWith('need:') ? 'Needs ' + why.slice(5) : why === 'gate' ? 'A finisher: from your third turn' : why === 'once' ? 'Once a fight' : '';   // its hover tip's last line
        b.classList.toggle('ready', !why && tb.heroTurn);
        b.classList.toggle('blocked', !!why && why !== 'cd' && !pas);
        const st = pas ? 'Passive' : cd ? turnsTxt(cd) : why === 'gate' ? 'Turn 3' : why === 'once' ? 'Used' : why.startsWith('need:') ? needTxt(why) : wait ? 'Wait' : 'Ready';
        if (b._sub.textContent !== st) { putText(b._sub, st); fitTextWidth(b._sub); }
      }
      const acd = tb.cds.attack || 0, res = typeof HERO_RESOURCE === 'object' && HERO_RESOURCE[k];
      putText(bAtk._sub, acd ? turnsTxt(acd) : res ? '+1 ' + res.name : '');
      setCd(bAtk, tb.cds.attack || 0, tb.max('attack'), wait);
      for (const b of [bAtk, ...bAbs]) b.classList.toggle('off', !tb.heroTurn && !b.classList.contains('passive') && !(tb.timing && (b === bAtk || abIds[+b.dataset.slot] === tb.timing)));
      for (let i = 0; i < 3; i++) bAbs[i].classList.toggle('live', !!tb.timing && abIds[i] === tb.timing);   // the ring: press it again
      for (const b of [bParry, bDodge]) { b.classList.toggle('off', !tb.windup); b.classList.toggle('live', tb.windup); }
      setN(bDodge, ''); setN(bParry, '');
    }
    bAtk.classList.toggle('wait', wait);
    for (let i = 0; i < 3; i++) bAbs[i].classList.toggle('wait', wait && !!abIds[i] && abIds[i] !== '?' && !bAbs[i].classList.contains('passive'));
    if (wait) for (const b of [bAtk, ...bAbs]) b.classList.remove('ready-now');   // a flash from the turn just played ends with it
    fillSkills(); fillFoe();
  }
  // desktop-tooltips: with a mouse, resting on a slot shows its name, key and what it does (the aria-label's text; the slot's own
  // card opens on a hold, the moves' help in the Abilities menu)
  const moveTip = k => `${INFO[k].name} (${INFO[k].key})\n${INFO[k].desc}`;
  setTip(bAtk, () => moveTip('atk')); setTip(bParry, () => moveTip('parry')); setTip(bDodge, () => moveTip('dodge'));
  bAbs.forEach((b, i) => setTip(b, () => { const id = abIds[i], a = id && SOLO_ABILITIES[id]; if (!a) return '';
    return `${a.name} (${KEY_LB['ab' + i]})\n${a.turnDesc || a.desc}` + (b._why && typeof turnBarInfo === 'function' && turnBarInfo() ? '\n' + b._why : ''); }));
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
  // Owner 2026-10-01: "you have to scroll past all of them every time". The Camp view shows only the heroes you can
  // play (or unlock right now) as small chips; "All heroes" opens a sheet with the whole roster, routes and stories.
  // Both use the same tap-twice confirm (a switch or an unlock is never one stray tap).
  // Menu audit 2026-10-01: it lives on the Hero tab (under your hero), not at the top of Camp.
  registerSection('party', {
    id: 'solo-hero', title: 'Switch hero', view: 'team',
    mount(sec) {
      sec.classList.add('solo-pick');
      const note = el('p', 'note', 'Switch any time, for free. Each hero keeps their own level.');
      const chips = el('div', 'sp-chips'), all = el('button', 'mini sp-all'); all.type = 'button';
      sec.append(note, chips, all);
      let armedK = '', armedA = '';
      const press = k => {
        const info = heroRouteInfo(k), action = info.playable ? 'switch' : info.ready && !info.unlocked ? 'unlock' : '';
        if (!action || (action === 'switch' && soloHero() === k)) return;
        if (armedK !== k || armedA !== action) { armedK = k; armedA = action; sec._up(); return; }
        armedK = armedA = '';
        const ok = action === 'unlock' ? heroUnlock(k) : heroPick(k);
        if (ok) { try { save(); } catch (e) {} ui(true); if (typeof updatePortrait === 'function') updatePortrait(); }
        sec._up();
      };
      const lvText = (k, info, lv, on_) => armedK === k ? (armedA === 'unlock' ? 'Confirm: unlock' : 'Confirm')
        : info.state === 'coming-soon' ? 'Coming soon' : info.playable ? `Lv ${(lv[k] || { L: 1 }).L}` + (on_ ? ' · Playing' : '') : info.ready ? 'Locked · Unlock' : 'Locked';
      const fig = (k, cv) => { try { if (heroHasKit(k) && typeof heroArtPreview === 'function') heroArtPreview(cv, k); } catch (e) {} };

      // the sheet: every hero, as the new-game picker shows them
      const ov = el('div', 'sp-ov hs-ov'); ov.id = 'heroSheet'; ov.hidden = true;
      ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'All heroes');
      const sh = el('div', 'sp-sheet hs-sheet'), head = el('div', 'sp-head');
      const x = el('button', 'sp-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close');
      head.append(el('b', null, 'All heroes'), el('small', null, 'Gold, gear and camp are shared. Each hero keeps their own level.'), x);
      const row = el('div', 'sp-row');
      sh.append(head, row); ov.append(sh); document.body.append(ov);
      const close = () => { ov.hidden = true; all.focus(); };
      x.addEventListener('click', close);
      ov.addEventListener('click', e => { if (e.target === ov) close(); });
      ov.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
      all.addEventListener('click', () => {
        ov.hidden = false; sec._up();
        if (!row._drawn) { row._drawn = true; requestAnimationFrame(() => { for (const b of sec._cards) fig(b.dataset.hero, b._cv); }); }
        x.focus();
      });
      // C9: all 32 heroes share the same route states as the new-game picker.
      sec._cards = HERO_ORDER.map(k => {
        const h = SOLO_HEROES[k], R = ROSTER[k];
        const b = el('button', 'sp-card'); b.type = 'button'; b.dataset.hero = k;
        const cv = el('canvas', 'sp-fig px'); cv.width = 56; cv.height = 80;
        const nm = el('b', null, R.name), sub = el('small', null, h ? `${h.role} · ${h.weapon}` : R.title);
        const lv = el('span', 'sp-lv'), route = el('small'), bio = el('small');
        b.append(cv, nm, sub, lv, route, bio);
        b._lv = lv; b._cv = cv; b._route = route; b._bio = bio;
        b.addEventListener('click', () => press(k));
        row.append(b);
        return b;
      });
      // the chips: who you can play, or unlock now (rebuilt when that set changes)
      let chipSig = '';
      const chipList = () => HERO_ORDER.filter(k => { const i = heroRouteInfo(k); return i.playable || (i.ready && !i.unlocked); });
      sec._up = () => {
        const lv = soloLevels(), cur = soloHero(), list = chipList(), sig = list.join();
        if (sig !== chipSig) {
          chipSig = sig;
          chips.replaceChildren(...list.map(k => {
            const c = el('button', 'sp-chip'); c.type = 'button'; c.dataset.hero = k;
            // the head portrait (28 x 28, 1 art px = 1 CSS px), as the header shows it
            let u = ''; try { u = heroHasKit(k) && typeof heroArtPortraitURL === 'function' ? heroArtPortraitURL(k) : typeof portraitURL === 'function' ? portraitURL(k) : ''; } catch (e) {}
            const im = img(u, 'sp-cfig px');
            const t = el('span', 'sp-ct'); c._lv = el('small');
            t.append(el('b', null, ROSTER[k].name.split(' ')[0]), c._lv);
            c.append(im, t); c.addEventListener('click', () => press(k));
            return c;
          }));
        }
        for (const c of chips.children) {
          const k = c.dataset.hero, info = heroRouteInfo(k), on_ = k === cur;
          c.classList.toggle('on', on_); c.setAttribute('aria-pressed', on_ ? 'true' : 'false');
          putAttr(c, 'data-armed', armedK === k ? '1' : '');
          putText(c._lv, lvText(k, info, lv, on_));
        }
        putText(all, `All heroes (${HERO_ORDER.length})`);
        // starters-join-when-met: with one hero of your own, the others are still on the road
        putText(note, list.filter(k => heroRouteInfo(k).playable).length > 1 ? 'Switch any time, for free. Each hero keeps their own level.' : 'Others join you on the road. Each hero keeps their own level.');
        if (ov.hidden) return;
        for (const b of sec._cards) {
          const k = b.dataset.hero, on_ = k === cur, info = heroRouteInfo(k);
          b.dataset.state = info.state;
          b.disabled = !info.playable && !(info.ready && !info.unlocked);
          b.setAttribute('aria-pressed', on_ ? 'true' : 'false');
          b.classList.toggle('on', on_);
          b.dataset.armed = armedK === k ? '1' : '';
          putText(b._route, info.unlocked ? (info.playable ? 'Unlocked' : 'Route complete. The solo kit comes later.') : info.how);
          putText(b._lv, lvText(k, info, lv, on_));
          putText(b._bio, info.bio); b._bio.hidden = !info.bio;
        }
      };
      sec._up();
    },
    update() { const s = $('sec-solo-hero'); if (s && s._up) s._up(); }
  });
}
