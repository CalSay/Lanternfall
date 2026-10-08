// 75-onboard-ui: progressive unlocks on screen and the guide's hints (docs/design/onboarding.md).
// Browser-only. Rules and state: 55-onboard.js. 70-ui.js leaves locked views out of the switcher
// (registerView/registerSection `feature`); this file hides locked tabs, the Gather/Raid buttons and
// the Next Up chip, announces what opened, marks new tabs and views until they are opened, draws the
// hint (a marker on the target and one sentence) and adds "Tips" to the Journal.
{
  const O = () => S.onboard;
  ONBOARD.gate = true;   // Next Up leaves out goals of systems still hidden
  ONBOARD.lessons = true;   // cal-0107-staged-guide: core holds the fight on the Dodge and Parry lessons (55-onboard guideLessonHold)

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
  // unlock-voice: Old Hesketh announces each new thing in the guide panel, one at a time, once a fight is over (never mid-turn).
  // The toast above still goes to the bell list. One line per row; Next Up (its guide step), the away strip (its own line) and
  // Hands (Tam's notice) say it elsewhere. Runtime queue only: an old save never replays one, and what a save already had stays quiet.
  const SAY_TXT = {
    party: "The Hero tab is open now. Your level, points and moves are kept there.",
    gather: "You can gather now. Bring me Pine Log for a proper fire, and we'll talk once it's lit.",
    bounties: "Folk have posted bounties on the Fight tab. They pay well for small jobs.",
    camp: "There. That's a camp. Build on it from the Camp tab.",
    forage: "You can forage now, under Gather. You'll mostly find fibre and herbs.",
    craft: 'You can make your own gear now. Craft is open.',
    bestiary: "The Bestiary is open on the Fight tab. It remembers every foe you've met.",
    almanac: "There's an Almanac at camp now. It tells you today's Omen.",
    uniques: 'Bosses sometimes drop rare gear. Craft keeps it, under Uniques.',
    tavern: "There's a Tavern at camp now. Folk on the road stop in there.",
    codex: "You've a Codex now, in the Journal. It keeps track of what you've found.",
    raid: 'The World raid is open at camp. Every player fights the same boss there.',
    stars: "You've earned Stars. They're on the Hero tab, and each one changes how you fight.",
    deep: 'The Deepwell is open on the Fight tab. You pick a boon between its floors.'
  };
  // defeat-card-guide-tip: a line that is not an unlock (check.mjs keeps SAY_TXT to systems). The first time a boss beats you, once the card is shut and the road is quiet.
  // cal-0107-staged-guide: the first Scroll (its toast hands over to him), and the slot for a second ability once it is learned.
  const SAY_MORE = {
    defeat: 'No shame in that. The card showed what beat you, and each try shows one more of its moves.',
    scroll: () => `That boss dropped a ${(SCROLLS[scrollId] || SCROLLS.moss || { name: 'Scroll' }).name}. Open Hero, then Abilities, and learn a new move with it.`,
    // learning a move from the Abilities view drops it into the first empty slot (75-abilities-ui), so he says where it went. The row reads
    // Attack, then slots Q, W, E in both views (75-solo-ui), so he names the move on its left as the row labels it (staged-guide-followups:
    // "next to Attack" was wrong once Echo sat between them)
    slot: () => {
      const eq = soloEquipped(), nm = (ABILITIES[slotAb] || {}).name || 'Your new move', at = eq.indexOf(slotAb);
      const left = at > 0 ? eq[at - 1] : null, leftNm = at === 0 ? 'Attack' : left ? (SOLO_ABILITIES[left] || {}).short || (ABILITIES[left] || {}).name : '';
      if (at >= 0) return leftNm ? `${nm} is next to ${leftNm} now. Press it there when it's ready.` : `${nm} is in slot ${'QWE'[at]} now. Press it there when it's ready.`;
      return eq.includes(null) ? `${nm} needs a slot. Tap an empty slot next to Attack and pick it.` : `${nm} needs a slot. Hold one of your moves next to Attack to swap it in.`;
    }
  };
  let slotAb = '', scrollId = 'moss';   // the move just learned (the slot line); the first Scroll found (the Scroll line)
  const sayText = id => { const t = SAY_TXT[id] || SAY_MORE[id]; try { return typeof t === 'function' ? t() : t; } catch (e) { return ''; } };
  // a line that no longer matches the game when its turn comes is dropped, never said (the Scroll already spent)
  const SAY_STILL = {
    gather: () => typeof hearthCold === 'function' && hearthCold() && typeof hearthLit === 'function' && !hearthLit(),   // his promise is for the cold fire only
    scroll: () => { try { return SCROLL_ORDER.some(id => scrollCount(id) > 0); } catch (e) { return false; } },
    slot: () => { try { return !!slotAb && soloAbilities().includes(slotAb); } catch (e) { return false; } }
  };
  const sayQ = []; let sayCur = '';
  function sayQueue(id) { if (sayText(id) && O().tips && !O().done['say:' + id] && !sayQ.includes(id)) sayQ.push(id); }
  const sayDone = id => { sayCur = ''; const i = sayQ.indexOf(id.slice(4)); if (i >= 0) sayQ.splice(i, 1); onboardUseDone(id); };
  // an unlock line held while up: a Got it, the game waits, and only between fights (never two lines at once)
  const sayStep = id => ({ id: 'say:' + id, text: sayText(id), ok: 1, pause: 1, ph: ['between'] });
  // cal-0107-staged-guide: a guide step already says some unlocks, so his unlock line would say it twice. The Hero tab at the first level-up is
  // the upgrade step's ("The Hero tab is open now..."); a cold Hearth's camp is the fire talk's and the Workbench steps' ("Open Camp and we'll build").
  const saidBySteps = id => (id === 'party' && !O().done.upgrade) || (id === 'camp' && typeof hearthCold === 'function' && hearthCold() && !O().done.bench);
  const TAB_FEATURE = { party: 'party', gather: 'gat', camp: 'world', craft: 'forge' };
  on('unlock', ({ id, quiet }) => {
    applyFeatures();
    if (quiet || id === '*') return;
    if (saidBySteps(id)) onboardUseDone('say:' + id); else sayQueue(id);
    if (!OPEN_TXT[id]) return;
    const tab = TAB_FEATURE[id];
    const ic = tab ? document.querySelector(`.tab[data-tab="${tab}"] img`) : null;
    toast(OPEN_TXT[id], 'good', ic ? ic.src : { ic: ['banner', '#F2C14E'] }, tab || id === 'nextup' ? 'high' : 'normal');
  });
  on('wipe', e => { if (e && e.boss && !e.arena) sayQueue('defeat'); });
  on('scrollDrop', e => { if (e && e.firstEver) { scrollId = e.id || 'moss'; sayQueue('scroll'); } });
  on('abilityLearned', e => { if (e && e.hero === soloHero() && soloAbilities().length > 1) { slotAb = e.id; sayQueue('slot'); } });
  // guide-goal-after-reload: his Pine Log line carries the first job, and the queue lives in memory only, so a reload before it was read
  // (Got it or ×) would lose it. Queue it again once a boot while the fire is still cold. Not an unlock, so the unlock spacing is untouched.
  try { if (isUnlocked('gather') && SAY_STILL.gather() && !O().done['say:gather']) sayQueue('gather'); } catch (e) {}
  // the upgrade step already brought you to the Hero tab and said what it is for: its first-use line would introduce it a second time
  on('onboardStep', e => { if (e && e.id === 'upgrade') onboardUseDone('use:party'); });
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
  const finish = s => s.id.startsWith('say:') ? sayDone(s.id) : s.id.startsWith('use:') ? onboardUseDone(s.id) : onboardDone(s.id);   // a first-use line is read, not a guide step
  okb.addEventListener('click', e => { e.stopPropagation(); if (curGo) curGo.fn(); else if (cur) finish(cur); tick(); });
  let cur = null;   // the step on screen
  x.addEventListener('click', e => { e.stopPropagation(); if (cur) finish(cur); tick(); });
  const chip = $('nuChip');
  if (chip) chip.addEventListener('click', () => onboardDone('nextup'));

  const q = s => document.querySelector(s);
  // UX-L1: in landscape a menu covers most of the stage, but the top row (Fight / Gather), Next Up and the action bar
  // stay on screen. onGame: the whole stage shows; onCtrl: those controls show.
  const onGame = () => !S.tab;
  guideMenuCovers = () => !isWide();   // portrait: an open menu hides the fight, so a fight tip waits for it to close
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
  // "Chop 12 Pine Log for the Workbench (5/12)". When the hero is not at the node that yields the
  // material, a Go button sends it there (setNode + Gather), so the player is never left guessing.
  const VERB = { wood: 'Chop', ore: 'Mine', crystal: 'Mine', hide: 'Hunt' };
  let weaponOpened = false;   // the Craft tab has opened itself on the first weapon this visit (the 'weapon' step)
  // forge-tip-goes-stale: a materials line shows on Camp, on Gather and on the game screen, never over another menu (it followed a fighter
  // onto every menu for 15 minutes and never moved). The step itself stays current (onboardStep), so nothing behind it starts and nothing is done.
  const STOCK_TABS = ['world', 'gat'];
  const stockHere = () => !S.tab || STOCK_TABS.includes(S.tab);
  // where a material comes from: its node, or "from fights" for essence and gold
  const matWhere = m => m.kind ? ` at the ${NODE_NAMES[m.kind][m.t - 1]}` : m.fam === 'ess' || m.fam === 'gold' ? ' from fights' : '';
  const stockSpec = (id, what, tail, at) => {   // at: name the node (gear-in-first-25: "Mine 3 Quartz at the Quartz Geode for your first weapon (0/3).")
    if (!stockHere()) return null;
    const need = onboardNeed(id); if (!need.length) return null;
    const x = need[0], verb = VERB[x.kind] || (x.fam === 'ess' ? 'Fight for' : 'Gather');
    // workbench-cost: a build row's gold ("Win 200 more gold for the Workbench (100/300)."); fights pay it, so the hint points at the fight
    const text = need.length > 1
      ? `You still need these for ${what}: ${need.map(m => `${m.name} ${m.have}/${m.n}${matWhere(m)}`).join(', ')}.`
      : x.fam === 'gold' ? `Win ${x.n - x.have} more gold in fights for ${what} (${x.have}/${x.n}).`
      : `${verb} ${x.n} ${x.name}${at && x.kind ? ` at the ${NODE_NAMES[x.kind][x.t - 1]}` : ''} for ${what} (${x.have}/${x.n}).${tail ? ' ' + tail : ''}`;
    if (x.fam === 'gold') return { text, live: 1, node: onGame() ? $('stage') : q(`.tab[data-tab="${S.tab}"]`), at: onGame() ? [0.74, 0.62] : null, side: 'up' };
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
  // Cal's play note 4: no word about swapping while every move you own already has a slot
  const swapTail = () => { try { return soloAbilities().length > soloEquipped().length ? ' Hold it to swap in another move.' : ''; } catch (e) { return ''; } };
  const SOLO_UI = {
    attack: () => onCtrl() && target() === 'mob' ? { node: sbtn('atk'), side: 'up', text: 'There it is. Press Attack and hit it.' } : null,
    ability: () => onCtrl() && target() === 'mob' ? { node: sbtn('ab0'), side: 'up', text: `${abName()} is ready now. Press it.${swapTail()}` } : null,
    dodge: () => onCtrl() && target() === 'mob' ? { node: sbtn('dodge'), side: 'up', text: turnTxt() ? "It's about to hit you. Press Dodge now and get out of the way." : 'See the red ring? A heavy hit is coming. Press Dodge and get out of the way.' } : null,
    parry: () => onCtrl() && target() === 'mob' ? { node: sbtn('parry'), side: 'up', text: turnTxt() ? 'Here comes another. Press Parry now, just before the blow lands.' : 'Another heavy one. Press Parry just before it lands, and it staggers.' } : null,
    boss: () => target() !== 'mob' || !mob || !mob.boss ? null : onGame() ? { node: $('stage'), at: [0.72, 0.62], side: 'up', text: turnTxt() ? "That's the zone boss. Watch its bar, and Dodge or Parry every hit." : "That's the zone boss. Watch the red rings, and Dodge or Parry at the last moment." }
      : isWide() ? { node: q(`.tab[data-tab="${S.tab}"]`), text: 'The zone boss is here. Close this menu and watch.' } : null,   // UX-L1: a landscape menu
    gather: () => {
      if (!onCtrl()) return null;
      const b = q('#modeSeg button[data-act="gather"]');
      return b && !b.hidden ? { node: b, text: 'Tap Gather and chop some Pine Log for the fire.' } : null;
    },
    'tab:party': () => S.tab === 'party' ? null : { node: q('.tab[data-tab="party"]'), text: 'Your level and moves are kept on the Hero tab. Tap it and have a look.' }
  };
  // Cal's play notes 9 and 13: a piece in the bag does nothing until it is on. The tip names it and the Equip button wears it in one tap;
  // the ring sits on the craft card's own Equip button when that card is up.
  const wearSpec = (kind, text) => {
    const w = wearPiece(kind); if (!w) return null;
    const nm = itemName(w.it), btn = q('#sec-craft-recipes .cf-resact .forge'), card = !!S.tab && vis(btn) && (btn.closest('.cf-res') || {}).dataset?.itemId === String(w.it.id);   // the card must show this piece
    return { text: text(nm), node: card ? btn : onGame() ? $('stage') : q(`.tab[data-tab="${S.tab}"]`), at: !card && onGame() ? [0.74, 0.62] : null, side: 'up',
      go: { label: `Equip ${nm}`, fn: () => { equipItem(w.it.id, w.pos); } } };
  };
  const STEP_UI = {
    // UX-L1: in landscape a menu leaves the rail and top row in view, so the hint stays over Camp and Gather and points at the lit tab
    // (forge-tip-goes-stale: stockSpec draws no materials line over any other menu)
    chop: () => (onGame() || isWide()) && atGrove() ? stockSpec('chop', 'the camp fire', 'Tap the tree yourself and it goes faster.') : null,
    back: () => S.tab === 'party' ? { node: q('#menuX'), side: 'up', text: "When you're done here, close the menu and the fight goes on.", go: { label: 'Back to the fight', fn: () => closeMenu() } } : null,
    'wear:tool': () => wearSpec('tool', nm => `Your ${nm} is still in your bag. A tool only helps once you wear it.`),
    'wear:weapon': () => wearSpec('weapon', nm => `Your ${nm} is still in your bag. Put it on and fight with it.`),
    'stock:bench': () => stockSpec('stock:bench', 'the Workbench'),
    'stock:tool': () => stockSpec('stock:tool', 'a Copper Pickaxe'),
    'stock:forge': () => stockSpec('stock:forge', 'the Forge'),
    'stock:store': () => stockSpec('stock:store', 'the Storehouse'),
    'stock:weapon': () => stockSpec('stock:weapon', 'your first weapon', '', true),
    light: () => {
      if (!onGame()) return isWide() ? { node: q(`.tab[data-tab="${S.tab}"]`), text: 'Shut that menu, then tap the fire to light it.' } : null;
      const f = $('hearthFire');
      if (atGrove() && f && !f.hidden) return { node: f, round: true, side: 'up', text: "Tap the fire and light it. I've missed the warmth." };
      if (S.activity !== 'gather' && onCtrl()) return { node: q('#modeSeg button[data-act="gather"]'), text: hearthCan().ok ? 'Tap Gather, and then you can light the fire.' : 'Tap Gather and chop some Pine Log. It burns well.' };
      return null;
    },
    bench: () => campPath('bench', ["The fire's burning now. Open Camp and we'll build.", 'Open Camp.', "Build a Workbench. That's where your tools are made."]),
    tool: () => {
      if (S.tab !== 'forge') return { node: q('.tab[data-tab="forge"]'), text: 'The Workbench is up. Open Craft and make your first tool.' };
      if (curView('forge') !== 'make') return { node: q('#viewSeg button[data-view="make"]') || q('.tab[data-tab="forge"]'), text: 'Open Make.' };
      const st = q('.cf-st[data-st="bench"]');
      if (st && st.getAttribute('aria-pressed') !== 'true') return { node: st, text: 'Tap the Workbench.' };
      // the list can open on a higher tier (the highest the Workbench has opened, or a Next Up pick): the Copper Pickaxe is Tier 1
      const t1 = q('#sec-craft-recipes .cf-tiers button[data-t="1"]');
      if (t1 && t1.getAttribute('aria-pressed') !== 'true') return { node: t1, text: 'Tap Tier 1.' };
      // (the recipe list can still be re-rendering right after the station is picked: point at the list, never at nothing)
      return { node: q('#sec-craft-recipes .cf-rec[data-kind="pick"] .cf-go') || q('#sec-craft-recipes') || st, side: 'up', text: "Make a Copper Pickaxe. You'll need one for the ore." };
    },
    // gear-in-first-25: a bow or staff is made at the Workbench, so for Wren and Pip the Forge is for ingots and metal gear
    forge: () => weaponAtBench() ? campPath('forge', ['Next, the Forge. Open Camp.', 'Open Camp.', 'Build the Forge. It makes ingots and metal gear.'])
      : campPath('forge', ["You'll want a weapon of your own. Open Camp.", 'Open Camp.', "Build the Forge. That's where weapons are made."]),
    // first-gold-and-camp-strip: the materials are in hand; tick() has opened Craft on the weapon (once a visit), and this tip rings the button
    weapon: () => {
      const k = weaponKind(); if (!k) return null;
      if (S.tab !== 'forge') return { node: q('.tab[data-tab="forge"]'), text: 'You have enough for your first weapon. Open Craft.' };
      if (curView('forge') !== 'make') return { node: q('#viewSeg button[data-view="make"]') || q('.tab[data-tab="forge"]'), text: 'Open Make.' };
      const st = q('.cf-st[data-st="' + CRAFT_KINDS[k].st + '"]');
      if (st && st.getAttribute('aria-pressed') !== 'true') return { node: st, text: 'Tap the ' + CRAFT_STATIONS[CRAFT_KINDS[k].st].n + '.' };
      return { node: q(`#sec-craft-recipes .cf-rec[data-kind="${k}"] .cf-go`) || q('#sec-craft-recipes') || st, side: 'up', text: 'Make your first weapon, then put it on.' };
    },
    // Cal's play note 15: only say the packs are near full when they are (the Storehouse plot also opens once the Forge is built)
    store: () => { const full = typeof hearthNearFull === 'function' && hearthNearFull(); return campPath('store', full ? ['Your packs are nearly full. Open Camp.', 'Open Camp.', 'Your packs are nearly full. Build a Storehouse to hold the rest.'] : ["The Forge is up. Open Camp. There's one more to build.", 'Open Camp.', "Build a Storehouse. It holds what your packs can't."]); },
    // Training: Hero tab, Training view, Train on Attack.
    // hero-progression-rework: with attributes on, the first point goes into Might.
    upgrade: () => Object.assign(typeof attrOn === 'function' && attrOn()
      ? path('party', 'attributes', '#attrRows .at-row[data-at="might"] .at-add[data-n="1"]',
        ['The Hero tab is open now. Open Hero and spend your new points.', 'Open Build.', 'Put a point in Might. It makes you hit harder.'])
      : path('party', 'training', '#trainRows .tr-row[data-mv="atk"] .buy',
        ['The Hero tab is open now. Open Hero and train with your gold.', 'Open Training.', 'Train Attack. Each level makes you hit harder.']), { side: S.tab === 'party' ? 'up' : '' }),
    'tab:gat': () => S.tab === 'gat' ? null : { node: q('.tab[data-tab="gat"]'), text: "Gather's open. Tap it and see what you can mine." },
    'tab:world': () => S.tab === 'world' ? null : { node: q('.tab[data-tab="world"]'), text: "You've made camp. Tap Camp and build." },
    'tab:forge': () => S.tab === 'forge' ? null : { node: q('.tab[data-tab="forge"]'), text: "Craft's open. Tap it and make gear." },
    nextup: () => onCtrl() ? { node: chip, text: FIRST_USE.nextup.text } : null
  };

  const USE_SHOWN_MS = 7000;   // a first-use line counts as read after this long on screen
  const BLOCK = '.create, .away-ov, .bsheet-ov, .modal, .dw-ov, .mm-ov';
  guideLineOk = () => !document.hidden && !q(BLOCK);   // core's lesson hold asks this: a line nobody can see must not hold the fight
  let lastKey = '', useT0 = 0, useId = '', lastGT = null, gapHeld = false;
  // the fight is on screen (no menu, or a landscape menu beside it) and you are fighting: a line here sits in the gap between two foes
  const fightInView = () => fightingNow() && (!S.tab || !guideMenuCovers());
  // a big moment card (the first boss's) is up, queued, or about to queue (the win's cache opens a tick after the kill)
  // (the hold waits for the card itself, never for the cache: the cache opens on a game tick, which a hold would stop, and the boss's own card
  // would then show alone with the cache's card after it)
  const cardUp = () => { try { return !!q('.mm-ov') || MOMENT_Q.some(m => m.tier === 'big'); } catch (e) { return false; } };
  const cachePending_ = () => typeof cachePending === 'function' && cachePending();
  const cardComing = () => cardUp() || cachePending_();
  function hide() { useT0 = 0; gapHeld = false; if (!layer.hidden) layer.hidden = true; if (!bub.hidden) bub.hidden = true; cur = null; curGo = null; lastKey = ''; lastNode = null; lastRect = null; ONBOARD.paused = false; const ap = $('app'); if (ap.classList.contains('guide-side')) ap.classList.remove('guide-side', 'guide-nu', 'guide-btn'); }
  // The hint used to re-read the target's pixel position and re-place itself every 250ms, so it
  // jumped whenever the stage moved under it (camera/zoom, screen shake, a pack spawning) even
  // though nothing about the guide itself had changed. Stage targets keep that cached placement.
  // Menu targets also follow scrolling and reflow of the same node; only a new target or view
  // brings it into sight. The band itself (60-onboard.css .ob-bub) stays CSS-docked.
  const panels = $('panels');
  let dirty = true, reveal = true, panelScrolled = false, lastTab = S.tab;
  function invalidate() { dirty = true; }
  function tick() {
    const dg = lastGT === null ? 0 : Math.max(0, GUIDE_RT.t - lastGT); lastGT = GUIDE_RT.t;   // game seconds since the last look
    if (S.tab !== lastTab) { lastTab = S.tab; dirty = true; reveal = true; }
    let step = null;
    try { step = onboardStep(); } catch (e) { console.error('[lanternfall] onboard step', e); }
    // unlock-voice: a new thing is announced only when no fight is in view, and the game waits on its Got it (cal-0107-staged-guide).
    // It goes before a between step that is not already up and holding (the news, then what to do), never over a fight lesson.
    // staged-guide-followups: nor while a big card is up or on its way (the first boss's card came 1 s after the Scroll line and covered it)
    if (sayQ.length && O().tips && !document.hidden && guidePhase(!guideMenuCovers()) === 'between') {
      const id = sayQ[0];
      if (SAY_STILL[id] && !SAY_STILL[id]()) sayDone('say:' + id);
      else if (sayCur === id || !step || ((step.ph || []).includes('between') && !(cur && cur.id === step.id && ONBOARD.paused))) {
        // the card first: he waits, and the gap after the kill waits with him (the card holds the game too), so after Continue he speaks before the next foe
        if (!sayCur && cardComing()) { hide(); ONBOARD.paused = fightInView() && cardUp() && !cachePending_(); return; }
        sayCur = id; step = sayStep(id);
      }
    }
    // no guide step: the system on screen may still owe its first-use line (never alongside a guide step), only with no fight in view
    // (staged-guide-followups: a landscape menu leaves the fight beside it, and the line spoke over it)
    if (!step && S.tab && (!fightInView() || guidePhase(true) === 'between')) { try { const cv = curView(S.tab), vw = viewsOf(S.tab).find(v => v.id === cv); step = onboardUse({ tab: S.tab, view: cv, feature: vw && vw.feature }); } catch (e) { step = null; } }
    if (!step || document.hidden || q(BLOCK)) return hide();
    const use = /^(use|say):/.test(step.id);
    // staged-guide-followups: a line that starts in the gap after a kill, with the fight in view, would show for under half a second before the
    // next foe walks in and hides it. A line you read (a Got it note, a first-use line) holds that gap until you tap it; a live-progress line
    // (materials, gold) waits for a calm screen instead (no fight, or a menu over it)
    const gap = fightInView() && ((step.ph || []).includes('between') || step.id.startsWith('use:')) && !onboardPaused(step) && !(cur && cur.id === step.id && gapHeld);
    if (gap && !(step.ok || step.id.startsWith('use:'))) return hide();
    gapHeld = gap || (gapHeld && !!cur && cur.id === step.id);
    // first-gold-and-camp-strip: the first weapon is ready to make, so Craft opens on it once (only from the game screen, never out of another menu)
    if (step.id === 'weapon' && !weaponOpened && !S.tab) { const k = weaponKind(); if (k) { weaponOpened = true; S.fSlot = k; S.fTier = 1; forgeGoalPicks++; setTab('forge'); } }
    let spec = null;
    const table = SOLO_UI[step.id] ? SOLO_UI : STEP_UI;
    // a first-use line has no target: it docks over the open menu with no ring, and pauses only to hold a gap between foes (gapHeld)
    try { spec = use ? { node: S.tab || step.id.startsWith('use:') ? panels : stageBox, text: step.text, noRing: true } : table[step.id] ? table[step.id]() : null; } catch (e) { spec = null; }
    if (!spec || !vis(spec.node)) return hide();
    // a menu step whose button is disabled waits (a build while the builder is busy): no ring, no pause, no tip
    if (table === STEP_UI && !use && !spec.noRing && !pressable(spec.node)) return hide();
    if (step.id.startsWith('use:')) { if (useId !== step.id) { useId = step.id; useT0 = 0; } if (!useT0) useT0 = Date.now(); else if (Date.now() - useT0 > USE_SHOWN_MS) { finish(step); return hide(); } }   // (a held say line waits for its Got it)
    // guide-voice: a live tip nobody answers for 60 s of play (game clock: a paused game adds none) retires to the Journal's Tips
    if (!use && step.tip && !step.needs && !ONBOARD.paused) {
      const R = GUIDE_RT.shown; R[step.id] = (R[step.id] || 0) + dg;
      if (R[step.id] >= GUIDE_QUIET && guideRetire(step.id)) return hide();
    }
    cur = step; curGo = spec.go || null;
    putHidden(okb, !(step.ok || curGo || gapHeld));
    putText(okb, curGo ? curGo.label : 'Got it');
    putToggle(bub, 'ok-row', !!(step.ok || gapHeld) && !curGo);   // a plain Got it sits beside the tip, so a short portrait stage keeps its height
    place(spec);
    // the game waits only while the step waits for you to read or press something now (playtest-1 note 1, W1-A):
    // never for a step that needs materials or time, and never while a press step is still short of what it costs.
    // A menu marker that cannot be tapped where it sits (scrolled out of reach, under another element) shows no ring
    // and pauses nothing.
    const lost = table === STEP_UI && !use && !spec.noRing && !reachable(spec.node);
    if (lost) ring.hidden = true;
    ONBOARD.paused = !lost && (onboardPaused(step) || gapHeld);
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
  // cal-0107-staged-guide: core has just held the fight for a lesson (show its line now), a press may have ended one (let the fight go on now),
  // and a kill opens the gap between fights where a held line can start (it can be shorter than one poll)
  for (const ev of ['guideHold', 'soloAttack', 'soloDodge', 'soloParry', 'ability', 'timingRing', 'kill']) on(ev, () => setTimeout(tick, 0));
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
      const row3 = el('div', 'ob-trow'), p3 = el('p', 'note');
      row3.append(p3);
      sec.append(row, row3, row2);
      b.addEventListener('click', () => { onboardTips(); save(); tick(); sec._up(true); });
      b2.addEventListener('click', () => { onboardUnlockAll(); save(); sec._up(true); });
      sec._up = () => {
        const over = GUIDE_STEPS.every(s => O().done[s.id]);
        putHidden(sec, O().all && over);
        putHidden(row, over);
        putText(p, O().tips ? 'Short tips point at what to try next.' : 'Tips are off.');
        putText(b, O().tips ? 'Skip tips' : 'Show tips');
        const skipped = GUIDE_STEPS.filter(s => O().done[s.id] === 2 && s.tip).map(s => s.tip);
        putHidden(row3, !skipped.length);
        putText(p3, skipped.length ? 'Tips you missed: ' + skipped.join(' ') : '');
        putHidden(row2, O().all);
      };
    },
    update() { const s = $('sec-onboard-tips'); if (s && s._up) s._up(); }
  });

  applyFeatures();
  tick();
}
