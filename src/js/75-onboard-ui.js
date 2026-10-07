// 75-onboard-ui: progressive unlocks on screen and the guide's hints (docs/design/onboarding.md).
// Browser-only. Rules and state: 55-onboard.js. 70-ui.js leaves locked views out of the switcher
// (registerView/registerSection `feature`); this file hides locked tabs, the Gather/Raid buttons and
// the Next Up chip, announces what opened, marks new tabs and views until they are opened, draws the
// hint (a marker on the target and one sentence) and adds "Tips" to the Journal.
{
  const O = () => S.onboard;
  ONBOARD.gate = true;   // Next Up leaves out goals of systems still hidden

  // ---------------- progressive unlocks ----------------
  const MODE_FEATURE = { gather: 'gather', raid: 'raid' };
  const tabBtns = [...document.querySelectorAll('.tabs .tab')];
  const tabShown = t => t === 'adv' || shownViews(t).length > 0;
  // A view (or a tab) is "new" from its unlock until the player first opens it.
  // "New" lasts 2 hours of play after the unlock, so a long-past unlock (an old save) never shows it (menu audit #19)
  const NEW_FOR = 7200;
  onboardIsNew = v => !!(v && v.feature && O().got[v.feature] != null && !O().seen[v.id] && O().t - O().got[v.feature] < NEW_FOR);
  const tabIsNew = t => t !== 'adv' && viewsOf(t).some(v => onboardIsNew(v)) && !O().seen[t];

  function applyFeatures() {
    let n = 0;
    for (const b of tabBtns) {
      const show = tabShown(b.dataset.tab);
      putHidden(b, !show); if (show) n++;
      putToggle(b, 'is-new', show && tabIsNew(b.dataset.tab));
    }
    const nav = document.querySelector('.tabs');
    // While some tabs are still hidden, the shown ones keep a tab's width instead of stretching.
    if (nav) { putStyle(nav, 'gridTemplateColumns', n < tabBtns.length ? `repeat(${Math.max(1, n)}, minmax(0, 112px))` : ''); putStyle(nav, 'justifyContent', n < tabBtns.length ? 'center' : ''); }
    // The Fight / Gather / Raid switch: a lone Fight button says nothing, so it waits for Gather.
    let modes = 0;
    for (const b of document.querySelectorAll('#modeSeg button')) {
      const show = featOk(MODE_FEATURE[b.dataset.act]) || S.activity === b.dataset.act;
      putHidden(b, !show); if (show) modes++;
    }
    putStyle($('modeSeg'), 'visibility', modes > 1 ? '' : 'hidden');
    putHidden($('nuSlot'), !featOk('nextup'));
    for (const sec of SECTIONS) if (sec.feature) putToggle(sec.el, 'f-off', !featOk(sec.feature));
    if (S.tab) { buildViewSeg(S.tab); applyView(S.tab); }
    viewDots();
  }

  // What opened, in one plain sentence. Tabs pop (high); views and smaller things are normal.
  const OPEN_TXT = {
    party: 'New tab: Hero.',
    gather: 'New tab: Gather.',
    camp: typeof hearthCold === 'function' && hearthCold() ? 'New tab: Camp.' : 'You made camp. A new tab: Camp.',
    craft: 'New tab: Craft.',
    bounties: 'New on the Fight tab: Bounties.',
    bestiary: 'New on the Fight tab: Bestiary.',
    forage: 'New on the Gather tab: Foraging.',
    almanac: 'New on the Camp tab: the Almanac.',
    roster: 'New on the Party tab: Roster. See who could join you.',
    synergy: 'Where each one stands matters. Put a tank in Front and a healer in Back for Lifeline.',
    uniques: 'New on the Craft tab: Uniques.',
    tavern: 'New on the Camp tab: the Tavern.',
    codex: 'The Codex is open. It tracks what you have found. Find it in the Journal.',   // = FIRST_USE.codex (55-onboard.js)
    raid: 'The World raid is open on the Camp tab.',
    deep: 'New on the Fight tab: the Deepwell.'
  };
  const TAB_FEATURE = { party: 'party', gather: 'gat', camp: 'world', craft: 'forge' };
  on('unlock', ({ id, quiet }) => {
    applyFeatures();
    if (quiet || id === '*' || !OPEN_TXT[id]) return;
    const tab = TAB_FEATURE[id];
    const ic = tab ? document.querySelector(`.tab[data-tab="${tab}"] img`) : null;
    toast(OPEN_TXT[id], 'good', ic ? ic.src : { ic: ['banner', '#F2C14E'] }, tab || id === 'nextup' ? 'high' : 'normal');
  });
  on('menuView', ({ tab, view }) => {
    const o = O();
    if (!o.seen[tab]) o.seen[tab] = 1;
    if (view && !o.seen[view]) {
      o.seen[view] = 1;
      const b = document.querySelector(`#viewSeg button[data-view="${view}"]`); if (b) b.classList.remove('is-new');
    }
    applyFeatures();
  });
  // Other systems that open a hidden place on their own.
  on('codexOpen', () => onboardReveal('codex'));
  on('activity', () => { if (S.activity === 'raid') onboardReveal('raid'); if (S.activity === 'gather') onboardReveal('gather'); });

  // ---------------- the guide: one hint at a time ----------------
  // The ring (marks the target) is a viewport-fixed overlay, same as before. The bubble is its own
  // element, docked exactly where placeToasts docks toasts: inside #stageBox on the game view,
  // inside #app (just above the tab bar) over a menu. Same parent, same coordinate space, so the
  // hint reads as one system with toasts and the two are pushed apart by --toast-h (70-ui.js),
  // never stacked on top of one another. HINT1.
  const layer = el('div', 'ob-layer'); layer.setAttribute('aria-live', 'polite');
  const ring = el('div', 'ob-ring' + (reduced ? ' still' : ''));
  layer.append(ring);
  layer.hidden = true;
  document.body.append(layer);
  // The guide panel: Old Hesketh's face on the left, the tip beside it, the Got it / Go button on its own row
  // under the text, a small dismiss in the corner. It is a notice, not a control (docs/design/layout.md), so
  // it docks where notices dock and never sits over the stage (place()).
  const bub = el('div', 'ob-bub'); bub.setAttribute('role', 'note'); bub.hidden = true;
  const face = el('img', 'ob-face px'); face.alt = ''; face.width = 48; face.height = 48;
  const faceBox = el('span', 'ob-facebox'); faceBox.setAttribute('aria-hidden', 'true'); faceBox.append(face);
  let faceKey = '';
  const faceUp = () => {   // Hesketh's roster portrait; a plain slot with his initial until it bakes
    let u = ''; try { u = typeof portraitURL === 'function' ? portraitURL('hesketh') : ''; } catch (e) { u = ''; }
    if (u === faceKey) return; faceKey = u;
    if (u) face.src = u; else face.removeAttribute('src');
    putToggle(faceBox, 'blank', !u);
  };
  const nm = el('b', 'ob-name', 'Old Hesketh');
  const txt = el('span', 'ob-txt');
  const x = el('button', 'ob-x'); x.type = 'button'; x.setAttribute('aria-label', 'Dismiss this tip'); x.textContent = '×';
  // SOLO1: a step whose action is reading it (the first boss) has a Got it button
  const okb = el('button', 'ob-ok'); okb.type = 'button'; okb.textContent = 'Got it'; okb.hidden = true;
  bub.append(faceBox, nm, txt, x, okb);
  // A waiting step may carry a Go button (spec.go): it takes the hero to the node that yields what the step needs.
  let curGo = null;
  const finish = s => s.id.startsWith('use:') ? onboardUseDone(s.id) : onboardDone(s.id);   // a first-use line is read, not a guide step
  okb.addEventListener('click', e => { e.stopPropagation(); if (curGo) curGo.fn(); else if (cur) finish(cur); tick(); });
  let cur = null;   // the step on screen
  x.addEventListener('click', e => { e.stopPropagation(); if (cur) finish(cur); tick(); });
  const chip = $('nuChip');
  if (chip) chip.addEventListener('click', () => onboardDone('nextup'));

  const q = s => document.querySelector(s);
  // UX-L1: in landscape a menu covers most of the stage, but the top row (Fight / Gather), Next Up and the action bar
  // stay on screen. onGame: the whole stage shows; onCtrl: those controls show.
  const onGame = () => !S.tab;
  const onCtrl = () => !S.tab || isWide();
  const vis = n => !!(n && n.getClientRects().length && n.offsetParent !== null);
  const first = nm => String(nm || '').split(' ')[0];
  // A marker must point at something the player can press right now. A disabled button, or a spot another element sits on,
  // rings nothing and never pauses the game (guide-target-guard). The stage is exempt: its targets are points inside the scene.
  const stageBox = $('stageBox');
  const pressable = n => !n.disabled && n.getAttribute('aria-disabled') !== 'true' && !n.closest('[inert]');
  function reachable(n) {
    if (stageBox.contains(n)) return true;
    const r = n.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
    const h = document.elementFromPoint(x, y);
    return !!h && (n.contains(h) || h.contains(n));
  }
  // Menu path: open the tab, then the view, then point at the thing.
  function path(tab, view, sel, words) {
    if (S.tab !== tab) return { node: q(`.tab[data-tab="${tab}"]`), text: words[0] };
    if (view && curView(tab) !== view) return { node: q(`#viewSeg button[data-view="${view}"]`), text: words[1] };
    const n = typeof sel === 'function' ? sel() : q(sel);
    return { node: n, text: words[2] };
  }
  // step id -> () => { node, text, at?: [fx, fy] (a point inside node) } | null
  // The cold Hearth (H1): the fire's button lives on the stage (63d-scenery-camp.js).
  const cold = () => typeof hearthCold === 'function' && hearthCold();
  const atGrove = () => target() === 'node' && S.node.kind === 'wood';
  const campPath = (id, words) => path('world', 'camp', `#camp-b-${id} .cb-quick`, words);
  // W1-A: a step that waits for materials shows live progress and never pauses the game.
  // "Chop 20 Pine Log for the Workbench (12/20)". When the hero is not at the node that yields the
  // material, a Go button sends it there (setNode + Gather), so the player is never left guessing.
  const VERB = { wood: 'Chop', ore: 'Mine' };
  const stockSpec = (id, what, tail) => {
    const need = onboardNeed(id); if (!need.length) return null;
    const x = need[0], verb = VERB[x.kind] || 'Gather';
    const text = need.length > 1
      ? `Gather for ${what}: ${need.map(m => `${m.name} ${m.have}/${m.n}`).join(', ')}.`
      : `${verb} ${x.n} ${x.name} for ${what} (${x.have}/${x.n}).${tail ? ' ' + tail : ''}`;
    const there = S.activity === 'gather' && x.kind && S.node.kind === x.kind && S.node.t === x.t;
    const spec = { text, live: 1 };
    if (there) {
      spec.node = onGame() ? $('stage') : q(`.tab[data-tab="${S.tab}"]`); spec.at = onGame() ? [0.74, 0.62] : null; spec.side = 'up';
    } else {
      const go = q('#modeSeg button[data-act="gather"]');
      spec.node = S.activity !== 'gather' && go && !go.hidden && onCtrl() ? go : onGame() ? $('stage') : q(`.tab[data-tab="${S.tab}"]`);
      if (spec.node === $('stage')) { spec.at = [0.74, 0.62]; spec.side = 'up'; }
      if (x.kind) spec.go = { label: `${verb} at the ${NODE_NAMES[x.kind][x.t - 1]}`, fn: () => { if (setNode(x.kind, x.t)) setActivity('gather'); } };
    }
    return spec;
  };
  // SOLO1: the button row under the stage (75-solo-ui)
  const sbtn = id => q(`#soloBar .sb-${id}`);
  const turnTxt = () => typeof turnCombatOn === 'function' && turnCombatOn();
  const abName = () => { try { const a = abilityInfo(); return a ? a.name : 'Your ability'; } catch (e) { return 'Your ability'; } };
  const SOLO_UI = {
    attack: () => onCtrl() && target() === 'mob' ? { node: sbtn('atk'), side: 'up', text: 'Foes ahead. Press Attack to strike the one in front.' } : null,
    ability: () => onCtrl() && target() === 'mob' ? { node: sbtn('ab0'), side: 'up', text: `${abName()} is ready. Press it. (Hold an ability slot to change what it holds.)` } : null,
    dodge: () => onCtrl() && target() === 'mob' ? { node: sbtn('dodge'), side: 'up', text: turnTxt() ? 'The foe is about to hit you. Press Dodge now to step out of the way. Every hit can be dodged or parried.' : 'A foe winds up a heavy hit (the red ring). Press Dodge to step out of the way.' } : null,
    parry: () => onCtrl() && target() === 'mob' ? { node: sbtn('parry'), side: 'up', text: turnTxt() ? 'Parry is harder: press it just before the hit lands. It blocks the hit and takes a turn off your cooldowns. Parry every hit of an attack to counter.' : 'Another heavy hit. Press Parry just before it lands: no damage, the foe staggers and you counter.' } : null,
    boss: () => target() !== 'mob' || !mob || !mob.boss ? null : onGame() ? { node: $('stage'), at: [0.72, 0.62], side: 'up', text: turnTxt() ? 'The zone boss! Dodge or Parry each blow. Stun it when it gathers a big move.' : 'The zone boss! Dodge or Parry when its red rings close.' }
      : isWide() ? { node: q(`.tab[data-tab="${S.tab}"]`), text: 'The zone boss is here! Close this menu to watch the fight.' } : null,   // UX-L1: a landscape menu
    gather: () => {
      if (!onCtrl()) return null;
      const b = q('#modeSeg button[data-act="gather"]');
      return b && !b.hidden ? { node: b, text: 'The road is cold. Tap Gather and chop Pine Log for a camp fire.' } : null;
    },
    'tab:party': () => S.tab === 'party' ? null : { node: q('.tab[data-tab="party"]'), text: 'New tab: Hero. Tap it.' }
  };
  const STEP_UI = {
    // UX-L1: in landscape a menu leaves the rail and top row in view, so the hint stays and points at the lit tab (close the menu)
    chop: () => (onGame() || isWide()) && atGrove() ? stockSpec('chop', 'the camp fire', 'Tap the tree to chop faster.') : null,
    'stock:bench': () => stockSpec('stock:bench', 'the Workbench'),
    'stock:tool': () => stockSpec('stock:tool', 'a Copper Pickaxe'),
    'stock:forge': () => stockSpec('stock:forge', 'the Forge'),
    'stock:store': () => stockSpec('stock:store', 'the Storehouse'),
    light: () => {
      if (!onGame()) return isWide() ? { node: q(`.tab[data-tab="${S.tab}"]`), text: 'Close this menu, then tap the fire to light it.' } : null;
      const f = $('hearthFire');
      if (atGrove() && f && !f.hidden) return { node: f, round: true, side: 'up', text: 'Tap the fire to light it.' };
      if (S.activity !== 'gather' && onCtrl()) return { node: q('#modeSeg button[data-act="gather"]'), text: hearthCan().ok ? 'Tap Gather, then light the fire.' : 'Tap Gather to chop Pine Log for the fire.' };
      return null;
    },
    bench: () => campPath('bench', ['The fire burns. Open Camp to build.', 'Open Camp.', 'Build the Workbench. It makes tools.']),
    tool: () => {
      if (S.tab !== 'forge') return { node: q('.tab[data-tab="forge"]'), text: 'The Workbench is built. Open Craft.' };
      if (curView('forge') !== 'make') return { node: q('#viewSeg button[data-view="make"]') || q('.tab[data-tab="forge"]'), text: 'Open Make.' };
      const st = q('.cf-st[data-st="bench"]');
      if (st && st.getAttribute('aria-pressed') !== 'true') return { node: st, text: 'Tap the Workbench.' };
      // the list can open on a higher tier (the highest the Workbench has opened, or a Next Up pick): the Copper Pickaxe is Tier 1
      const t1 = q('#sec-craft-recipes .cf-tiers button[data-t="1"]');
      if (t1 && t1.getAttribute('aria-pressed') !== 'true') return { node: t1, text: 'Tap Tier 1.' };
      // (the recipe list can still be re-rendering right after the station is picked: point at the list, never at nothing)
      return { node: q('#sec-craft-recipes .cf-rec[data-kind="pick"] .cf-go') || q('#sec-craft-recipes') || st, side: 'up', text: 'Make a Copper Pickaxe.' };
    },
    forge: () => campPath('forge', ['Open Camp to build the Forge.', 'Open Camp.', 'Build the Forge for your weapon.']),
    store: () => campPath('store', ['Your packs are nearly full. Open Camp.', 'Open Camp.', 'Your packs are nearly full. Build a Storehouse.']),
    // Training: Hero tab, Training view, Train on Attack.
    // hero-progression-rework: with attributes on, the first point goes into Might.
    upgrade: () => Object.assign(typeof attrOn === 'function' && attrOn()
      ? path('party', 'attributes', '#attrRows .at-row[data-at="might"] .at-add[data-n="1"]',
        ['You have points to spend. Open Hero.', 'Open Build.', 'Add a point to Might. It makes Attack hit harder.'])
      : path('party', 'training', '#trainRows .tr-row[data-mv="atk"] .buy',
        ['You have gold. Open Hero to train.', 'Open Training.', 'Train Attack. Each level hits harder.']), { side: S.tab === 'party' ? 'up' : '' }),
    'tab:gat': () => S.tab === 'gat' ? null : { node: q('.tab[data-tab="gat"]'), text: 'New tab: Gather. Tap it to see what you can mine.' },
    'tab:world': () => S.tab === 'world' ? null : { node: q('.tab[data-tab="world"]'), text: 'You made camp. Tap Camp to build.' },
    'tab:forge': () => S.tab === 'forge' ? null : { node: q('.tab[data-tab="forge"]'), text: 'New tab: Craft. Tap it to make gear.' },
    nextup: () => onCtrl() ? { node: chip, text: FIRST_USE.nextup.text } : null
  };

  const USE_SHOWN_MS = 7000;   // a first-use line counts as read after this long on screen
  const BLOCK = '.create, .away-ov, .bsheet-ov, .modal, .dw-ov, .mm-ov';
  let lastKey = '', useT0 = 0;
  function hide() { useT0 = 0; if (!layer.hidden) layer.hidden = true; if (!bub.hidden) bub.hidden = true; cur = null; curGo = null; lastKey = ''; lastNode = null; lastRect = null; ONBOARD.paused = false; const ap = $('app'); if (ap.classList.contains('guide-side')) ap.classList.remove('guide-side', 'guide-nu', 'guide-btn'); }
  // The hint used to re-read the target's pixel position and re-place itself every 250ms, so it
  // jumped whenever the stage moved under it (camera/zoom, screen shake, a pack spawning) even
  // though nothing about the guide itself had changed. Stage targets keep that cached placement.
  // Menu targets also follow scrolling and reflow of the same node; only a new target or view
  // brings it into sight. The band itself (60-onboard.css .ob-bub) stays CSS-docked.
  const panels = $('panels');
  let dirty = true, reveal = true, panelScrolled = false, lastTab = S.tab;
  function invalidate() { dirty = true; }
  function tick() {
    if (S.tab !== lastTab) { lastTab = S.tab; dirty = true; reveal = true; }
    let step = null;
    try { step = onboardStep(); } catch (e) { console.error('[lanternfall] onboard step', e); }
    // no guide step: the system on screen may still owe its first-use line (never alongside a guide step)
    if (!step && S.tab) { try { const cv = curView(S.tab), vw = viewsOf(S.tab).find(v => v.id === cv); step = onboardUse({ tab: S.tab, view: cv, feature: vw && vw.feature }); } catch (e) { step = null; } }
    if (!step || document.hidden || q(BLOCK)) return hide();
    const use = step.id.startsWith('use:');
    let spec = null;
    const table = SOLO_UI[step.id] ? SOLO_UI : STEP_UI;
    // a first-use line has no target: it docks over the open menu with no ring, and never pauses the game
    try { spec = use ? { node: panels, text: step.text, noRing: true } : table[step.id] ? table[step.id]() : null; } catch (e) { spec = null; }
    if (!spec || !vis(spec.node)) return hide();
    // a menu step whose button is disabled waits (a build while the builder is busy): no ring, no pause, no tip
    if (table === STEP_UI && !use && !spec.noRing && !pressable(spec.node)) return hide();
    if (use) { if (!useT0) useT0 = Date.now(); else if (Date.now() - useT0 > USE_SHOWN_MS) { onboardUseDone(step.id); return hide(); } }
    cur = step; curGo = spec.go || null;
    putHidden(okb, !(step.ok || curGo));
    putText(okb, curGo ? curGo.label : 'Got it');
    putToggle(bub, 'ok-row', !!step.ok && !curGo);   // a plain Got it sits beside the tip, so a short portrait stage keeps its height
    place(spec);
    // the game waits only while the step waits for you to read or press something now (playtest-1 note 1, W1-A):
    // never for a step that needs materials or time, and never while a press step is still short of what it costs.
    // A menu marker that cannot be tapped where it sits (scrolled out of reach, under another element) shows no ring
    // and pauses nothing.
    const lost = table === STEP_UI && !use && !spec.noRing && !reachable(spec.node);
    if (lost) ring.hidden = true;
    ONBOARD.paused = !lost && onboardPaused(step);
  }
  soloGuideWants = () => (cur && !layer.hidden ? cur.id : '');
  // The guide's steps and their targets, for tools/check.mjs (the browser check walks the first session).
  onboardSpec = id => { const table = SOLO_UI[id] ? SOLO_UI : STEP_UI; try { return table[id] ? table[id]() : null; } catch (e) { return null; } };
  let lastNode = null, lastRect = null;
  function place(spec) {
    const key = spec.text, newTarget = spec.node !== lastNode;
    const inPanel = !!S.tab && panels.contains(spec.node);
    // everything but the stage keeps its place under the marker, so a target that moves (the menu sliding in, a list
    // re-sorting) drags the ring with it; the stage moves under its marker all the time and keeps its cached spot
    const follow = !stageBox.contains(spec.node);
    let r = follow ? spec.node.getBoundingClientRect() : null;
    const moved = follow && (!lastRect || r.left !== lastRect.left || r.top !== lastRect.top || r.width !== lastRect.width || r.height !== lastRect.height);
    if (ring.hidden !== !!spec.noRing) ring.hidden = !!spec.noRing;
    const changed = dirty || newTarget || key !== lastKey || (inPanel && panelScrolled) || moved;
    if (layer.hidden) layer.hidden = false;
    if (bub.hidden) bub.hidden = false;
    if (key !== lastKey) {
      const fresh = !lastKey; lastKey = key; txt.textContent = spec.text;
      // live progress ("12/20") updates in place; only a new hint pops
      if (fresh || !spec.live) { bub.classList.remove('pop'); if (!reduced) { void bub.offsetWidth; bub.classList.add('pop'); } }
    }
    if (!changed) return;   // no real layout change and the same target/text: leave it exactly where it is
    dirty = false; panelScrolled = false; lastNode = spec.node;
    // the panel docks where notices dock and never over the stage: landscape, the side column (its notices slot;
    // it stands in for Next Up while it speaks, except for the Next Up step itself, which points at the chip);
    // portrait, a slot in the game view just above the Act / Skills / Foe bar (the stage gives up the height);
    // over a menu, the bottom of the menu panel. Only the parent and a mode class ever change.
    const wide = isWide(), mode = wide ? 'side' : S.tab ? 'over-menu' : 'dock';
    const home = mode === 'dock' ? $('game') : $('app');
    if (bub.parentNode !== home) home.append(bub);
    for (const m of ['side', 'over-menu', 'dock']) bub.classList.toggle(m, m === mode);
    bub.classList.toggle('nu', mode === 'side' && spec.node === chip);
    // landscape, a step with a button (read it, or Go) takes the dock's room too: the column is short and the button must not clip
    const btn = mode === 'side' && !okb.hidden;
    bub.classList.toggle('btn', btn);
    putToggle($('app'), 'guide-side', mode === 'side'); putToggle($('app'), 'guide-nu', mode === 'side' && spec.node === chip); putToggle($('app'), 'guide-btn', btn);
    faceUp();
    if (!inPanel) r = null;   // the dock may have moved the stage (portrait: the panel takes a slot): read the target after it
    // UX-L1: a target inside the menu's scrolling content that is out of sight (a short landscape menu: the Make view's
    // recipes, a camp building further down) is scrolled into view on a new target/view. Ordinary
    // scroll or reflow only moves the ring, so following it never pulls the player back.
    if (inPanel && !spec.noRing && (newTarget || reveal)) {
      const pr = panels.getBoundingClientRect();
      if (r.height && (r.top < pr.top || r.bottom > pr.bottom - (bub.classList.contains('over-menu') ? bub.offsetHeight + 12 : 56))) {
        scrollMenuTo(spec.node);
        r = spec.node.getBoundingClientRect();
      }
    }
    reveal = false;
    // the marker: a ring around the node, or a round mark at a point inside it (never a filled
    // shape, so it never covers the node/foe underneath)
    if (!r) r = spec.node.getBoundingClientRect();
    lastRect = follow ? r : null;
    if (!spec.noRing) {
      let rx, ry, rw, rh;
      if (spec.at) { const d = 58; rx = r.left + r.width * spec.at[0] - d / 2; ry = r.top + r.height * spec.at[1] - d / 2; rw = rh = d; }
      else { rx = r.left - 4; ry = r.top - 4; rw = r.width + 8; rh = r.height + 8; }
      ring.classList.toggle('dot', !!(spec.at || spec.round));
      putStyle(ring, 'transform', `translate(${Math.round(rx)}px, ${Math.round(ry)}px)`);
      putStyle(ring, 'width', Math.round(rw) + 'px'); putStyle(ring, 'height', Math.round(rh) + 'px');
    }
  }
  try { new ResizeObserver(invalidate).observe($('stageBox')); } catch (e) {}   // the stage gives up height when the panel docks: re-place the ring
  setInterval(tick, 250);
  panels.addEventListener('scroll', () => { panelScrolled = true; tick(); }, { passive: true });
  addEventListener('resize', () => { invalidate(); tick(); });
  on('onboardStep', () => setTimeout(tick, 0));
  on('telegraphStart', () => setTimeout(tick, 0));   // SOLO1: the Dodge and Parry steps catch the wind-up at its start
  on('soloHero', () => setTimeout(tick, 0));
  on('menuView', () => { reveal = true; invalidate(); });

  // ---------------- Journal: Tips ----------------
  registerSection('log', {
    id: 'onboard-tips', title: 'Tips',
    mount(sec) {
      sec.classList.add('ob-tips');
      sec.parentNode.prepend(sec);   // first in the Journal while it matters
      const row = el('div', 'ob-trow'), p = el('p', 'note'), b = el('button', 'ob-tbtn'); b.type = 'button';
      row.append(p, b);
      const row2 = el('div', 'ob-trow'), p2 = el('p', 'note', 'New tabs open as you play.'), b2 = el('button', 'ob-tbtn', 'Show every tab now'); b2.type = 'button';
      row2.append(p2, b2);
      sec.append(row, row2);
      b.addEventListener('click', () => { onboardTips(); save(); tick(); sec._up(true); });
      b2.addEventListener('click', () => { onboardUnlockAll(); save(); sec._up(true); });
      sec._up = () => {
        const over = GUIDE_STEPS.every(s => O().done[s.id]);
        putHidden(sec, O().all && over);
        putHidden(row, over);
        putText(p, O().tips ? 'Short tips point at what to try next.' : 'Tips are off.');
        putText(b, O().tips ? 'Skip tips' : 'Show tips');
        putHidden(row2, O().all);
      };
    },
    update() { const s = $('sec-onboard-tips'); if (s && s._up) s._up(); }
  });

  applyFeatures();
  tick();
}
