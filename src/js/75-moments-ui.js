// 75-moments-ui: the moment layer (card moment-layer; early-game plan section 1). Browser-only.
// Big moments always show, with a reveal. Three tiers:
//   big     a card over the stage, tap to continue: first boss win, any unique, a cache opened, a new hero.
//           (The Great Lantern keeps its own card in 75-lantern-ui; only one big card is ever up.)
//   medium  a banner in the notices slot (the toast dock: the side column in landscape, under the HUD in portrait; never a new
//           control) for at least MOMENT_TUNE.bannerS seconds: the first level up and every 5th, new ability, new Star, a look
//           found, a rare-or-better craft. At most one a fight end (the rest fold in as lines) and at most
//           MOMENT_TUNE.midMax in any MOMENT_TUNE.midWindowS seconds during the first MOMENT_TUNE.midFirstS seconds of play.
//   small   today's toasts (23n-data-notices).
// A big or medium moment is never demoted to the bell and never waits behind a guide step or a story card. It queues to
// the end of the turn (never shown while a turn is in motion, so it never covers a parry window) and shows at once outside one. It does
// wait for the guide step on screen, the Away and What's-new cards, and the first seconds after boot.
// Several at fight end fold into one card with a list. Reduced motion: the same card, no burst.
// API for later cards:  moment(kind, { title, sub, rarity, icon, still, lines, actions })
//   kind     'boss' | 'unique' | 'cache' | 'hero' | 'champion' | 'starFirst' (big; a cache with a look is big too); 'level' | 'ability' | 'star' | 'look' | 'craft' (medium)
//   title    the name, one line;  sub  one short line;  rarity  common..legendary (the colour; else the kind's own)
//   icon     an icon spec for iconOf() ({ item }, { mat }, { ic });  still  a data URL (a bigger picture)
//   lines    [{ txt, ic? }] a short list under the title;  actions  [{ txt, fn }] extra buttons beside Continue
//   bark     a hero-voice moment id (55-voice.js): the story hero's line shows on the card or banner with their portrait. At most one bark a
//            flush (the strongest, VOICE_PRIO). kind 'bark' is a banner of just the line, dropped after 20 s if the banner budget has no room.
// momentState() -> { up, banner, queued } for the checks. Nothing here is saved: a moment not yet seen when the game closes
// is dropped (a unique already sits in the trophy wall).
const MOMENT_TUNE = { bannerS: 2.6, bannerExtraS: 0.7, settleS: 0.3, tapLockMs: 700, maxLines: 5, maxBanner: 3, bootS: 4, guideWaitS: 1, midMax: 2, midWindowS: 180, midFirstS: 1800 };
const MOMENT_KINDS = {
  boss: { tier: 'big', eye: 'Boss down', col: '#F2C14E', snd: 'big' },
  unique: { tier: 'big', eye: 'Unique loot', col: '#FF8A3D', snd: 'big' },
  cache: { tier: 'big', eye: 'Lantern Cache', col: '#F2C14E', snd: 'big' },
  hero: { tier: 'big', eye: 'New hero', col: '#B58CFF', snd: 'big' },
  champion: { tier: 'big', eye: 'Champion down', col: '#F2C14E', snd: 'big' },
  starFirst: { tier: 'big', eye: 'Your first Star', col: '#F2C14E', snd: 'big' },
  level: { tier: 'medium', eye: 'Level up', col: '#6FCB6A', snd: 'mid' },
  ability: { tier: 'medium', eye: 'New ability', col: '#5FA8FF', snd: 'mid' },
  star: { tier: 'medium', eye: 'New Star', col: '#F2C14E', snd: 'mid' },
  look: { tier: 'medium', eye: 'Look found', col: '#B58CFF', snd: 'mid' },
  craft: { tier: 'medium', eye: 'Well made', col: '#5FA8FF', snd: 'mid' },
  bark: { tier: 'medium', eye: '', col: '#F2C14E', snd: 'mid' }
};
const MOMENT_RARITY = { common: '#CFC6D8', uncommon: '#6FCB6A', rare: '#5FA8FF', epic: '#B58CFF', legendary: '#FF8A3D' };
const MOMENT_Q = [];
const MOMENT_UI = { ov: null, banner: null, bannerT: 0, wait: 0, lastFocus: null, shownAt: 0, midAt: [], guideT: 0 };
// check.mjs sets lanternfall.test.nostory in its browser contexts so a card never sits over a test's first click; the moment layer's
// own checks set lanternfall.test.moments to keep it on
const MOMENT_OFF = (() => { try { return localStorage.getItem('lanternfall.test.nostory') === '1' && localStorage.getItem('lanternfall.test.moments') !== '1'; } catch (e) { return false; } })();
function moment(kind, o) {
  if (MOMENT_OFF) return false;
  o = o || {};
  const say = o.bark && typeof voiceSay === 'function' ? voiceSay(o.bark) : null;
  if (kind === 'bark' && !say) return false;   // a hero with no line stays silent
  const k = MOMENT_KINDS[kind] || { tier: 'medium', eye: '', col: '#F2C14E', snd: 'mid' };
  MOMENT_Q.push(Object.assign({}, o, { kind, tier: k.tier, eye: o.eye || k.eye, col: (o.rarity && MOMENT_RARITY[o.rarity]) || o.col || k.col, snd: k.snd, say, at: Date.now() }));
  MOMENT_UI.wait = 0;
  return true;
}
// Cal's play note 9: a unique that lands in the bag is one tap from being worn. -> an action for the card, or null when it is not in the
// bag, the hero cannot use it, or the hero already wears something at least as strong in that spot.
function momentEquipAction(it) {
  try {
    const pos = it && itemById(it.id) ? kindPos(it.slot) : null;
    if (!pos || !(pos in S.equip) || !fits(it, pos, 'hero')) return null;
    const cur = equipped(pos); if (cur && (cur.id === it.id || itemPower(cur) >= itemPower(it))) return null;
    return { txt: `Equip ${itemName(it)}`, fn: () => { equipItem(it.id, pos); } };
  } catch (e) { return null; }
}
// ... and when the hero cannot wear it, say where it went, so the card never looks like loot that vanished.
function momentWearNote(it) {
  try {
    const pos = it && itemById(it.id) ? kindPos(it.slot) : null;
    return pos && (pos in S.equip) && !fits(it, pos, 'hero') ? { txt: 'You cannot wear it. It waits in your bag for a hero who can.' } : null;
  } catch (e) { return null; }
}
function momentState() { return { up: !!MOMENT_UI.ov, banner: !!MOMENT_UI.banner, queued: MOMENT_Q.length }; }
{
  // a turn is in motion (a hit, a windup, a parry window). The waiting phases (the next foe's intro, the hero's turn, the handoff: the game's own
  // turnWaiting) are not: no parry window is open, so a card there covers nothing, and an idle player at the hero's turn must still see their unique.
  const fighting = () => { try { return typeof TURN_LIVE !== 'undefined' && !!TURN_LIVE && !TURN_LIVE.ended && !['intro', 'hero', 'handoff'].includes(TURN_LIVE.phase); } catch (e) { return false; } };
  const bootT = performance.now();
  // a card up, the guide's step, the What's-new window or the first seconds after boot hold a moment back
  // (the guide's step gets guideWaitS seconds to finish, then the moment shows over it: a step left on screen must not hide a unique)
  const blocked = () => !!document.querySelector('.away-ov, #createScreen, .join-ov, .gl-ov, .dd-fc-ov') || document.hidden || NEWS.open || performance.now() - bootT < MOMENT_TUNE.bootS * 1000
    || (guideBusy() && MOMENT_UI.guideT < MOMENT_TUNE.guideWaitS)
    || (typeof storyBusy === 'function' && MOMENT_Q.some(q => q.kind === 'champion' && q.scene && storyBusy(q.scene)))   // a Champion's scene plays first, then its card
    || (typeof cachePending === 'function' && cachePending() && MOMENT_Q.some(q => q.kind === 'champion'));   // the win's cache opens a tick after the kill and folds into the card; never show the card without it
  // medium moments in the first half hour: at most midMax in any midWindowS seconds
  const midRoom = () => {
    const u = MOMENT_UI, now = notes.clock;   // game seconds, like midFirstS: the window must not run on a different clock than the game
    u.midAt = u.midAt.filter(t => now - t < MOMENT_TUNE.midWindowS);
    return notes.clock >= MOMENT_TUNE.midFirstS || u.midAt.length < MOMENT_TUNE.midMax;
  };
  holdGame(() => !!MOMENT_UI.ov);   // the hero is not hit while a card is up
  function closeCard() {
    const u = MOMENT_UI; if (!u.ov) return;
    u.ov.remove(); u.ov = null;
    if (u.lastFocus && u.lastFocus.focus && document.contains(u.lastFocus)) try { u.lastFocus.focus({ preventScroll: true }); } catch (e) {}
    u.wait = 0;
    try { ui(true); } catch (e) {}
  }
  function lineRow(l) {
    const li = el('li');
    if (l.ic) { try { li.append(img(iconURL(...l.ic))); } catch (e) {} }
    else if (l.icon) { try { const u = iconOf(l.icon); if (u) li.append(img(u)); } catch (e) {} }
    li.append(el('span', null, l.txt));
    return li;
  }
  // hero-voice: the story hero's line and portrait
  const portraitOf = key => { try { return portraitURL(key === (typeof soloHero === 'function' && soloHero()) ? 'hero' : key) || ''; } catch (e) { return ''; } };
  function sayBox(say) {
    const b = el('div', 'mm-say'), u = portraitOf(say.key);
    if (u) b.append(img(u, 'mm-say-pt'));
    const t = el('div', 'mm-say-tx'); t.append(el('p', null, '\u201C' + say.line + '\u201D'), el('small', null, say.who));
    b.append(t);
    return b;
  }
  // one bark a flush: the strongest says it, on the first item; a bark-only moment is dropped when something else carries the line
  function withSay(list) {
    const src = list.find(x => x.say && x.bark === voicePick(list.filter(y => y.say).map(y => y.bark)));
    const rest = list.filter(x => x.kind !== 'bark').map(x => (x.say ? Object.assign({}, x, { say: null }) : x));
    if (!src) return rest.length ? rest : list;
    if (rest.length) { rest[0] = Object.assign({}, rest[0], { say: src.say }); return rest; }
    return [Object.assign({}, src, { eye: src.say.who, title: '\u201C' + src.say.line + '\u201D', say: null, pic: portraitOf(src.say.key) })];
  }
  function showCard(list) {
    const u = MOMENT_UI, first = list[0];
    u.lastFocus = document.activeElement;
    try { noticeAsk('card:moment', first.title || first.eye); } catch (e) {}   // the card channel (23n-data-notices)
    const ov = el('div', 'mm-ov' + (reduced ? ' still' : ''));
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'mmHead');
    ov.style.setProperty('--mc', first.col);
    const card = el('div', 'mm-card');
    card.append(el('div', 'mm-eye', first.eye));
    const art = el('div', 'mm-art'), burst = el('div', 'mm-burst');
    art.append(burst);
    let pic = null; try { pic = first.still || first.pic || (first.icon && iconOf(first.icon)); } catch (e) {}
    if (pic) { const im = img(pic, 'mm-img'); art.append(im); }
    card.append(art);
    const h = el('h2', 'mm-head', first.title || first.eye); h.id = 'mmHead';
    card.append(h);
    if (first.sub) card.append(el('p', 'mm-sub', first.sub));
    if (first.say) card.append(sayBox(first.say));
    // the rest of the queue (and any lines of the first) fold into one list
    const rows = (first.lines || []).slice();
    for (const x of list.slice(1)) rows.push({ txt: [x.eye, x.title].filter(Boolean).join(': '), icon: x.icon });
    if (rows.length) {
      const ul = el('ul', 'mm-list');
      for (const l of rows.slice(0, MOMENT_TUNE.maxLines)) ul.append(lineRow(l));
      if (rows.length > MOMENT_TUNE.maxLines) ul.append(el('li', 'mm-more', `And ${rows.length - MOMENT_TUNE.maxLines} more.`));
      card.append(ul);
    }
    const acts = el('div', 'mm-acts');
    for (const a of (first.actions || [])) {
      const b = el('button', 'big mm-act', a.txt); b.type = 'button';
      b.addEventListener('click', e => { e.stopPropagation(); closeCard(); try { a.fn && a.fn(); } catch (err) { console.error('[lanternfall] moment action', err); } });
      acts.append(b);
    }
    const go = el('button', 'big forge mm-go', 'Continue'); go.type = 'button';
    acts.append(go); card.append(acts);
    ov.append(card);
    u.shownAt = Date.now();
    const tryClose = () => { if (Date.now() - u.shownAt >= MOMENT_TUNE.tapLockMs) closeCard(); };   // a fight tap must not skip the card
    ov.addEventListener('click', tryClose);
    ov.addEventListener('keydown', ev => { if (ev.key === 'Escape') tryClose(); if (ev.key === 'Tab') { ev.preventDefault(); go.focus(); } });
    document.body.append(ov); u.ov = ov;
    go.focus({ preventScroll: true });
    emit('momentShow', { tier: 'big', kind: first.kind, n: list.length, zone: first.zone });
  }
  // The medium banner is a toast in the notices slot, held for bannerS seconds: a later toast cannot retire it (70-ui popToast).
  function showBanner(list) {
    const u = MOMENT_UI, box = $('toasts'); if (!box) return;
    if (u.banner) { dropToast(u.banner); u.banner = null; }
    const shown = list.slice(0, MOMENT_TUNE.maxBanner), first = shown[0];
    let pic = null; try { pic = first.pic || (first.icon && iconOf(first.icon)); } catch (e) {}
    // built here, not by makeToast: a moment sits outside the pop budget and the toast counters (tools/check.mjs counts makeToast calls)
    const t = el('div', 'toast good hi mm-toast');
    t._p = 2; t._kind = 'good'; t._more = 0;
    t.setAttribute('role', 'status'); t.style.setProperty('--mc', first.col);
    t.addEventListener('pointerdown', e => e.stopPropagation());
    t.addEventListener('click', () => { dropToast(t, 'gone'); if (u.banner === t) u.banner = null; });
    if (pic) t.append(img(pic));
    const tx = el('div', 'mm-t-tx');
    tx.append(el('div', 'mm-t-eye', first.eye), el('div', 'mm-t-title', first.title || ''));
    if (first.sub && shown.length === 1) tx.append(el('div', 'mm-t-sub', first.sub));
    if (first.say) tx.append(el('div', 'mm-t-say', '\u201C' + first.say.line + '\u201D'));
    for (const x of shown.slice(1)) tx.append(el('div', 'mm-t-line', [x.eye, x.title].filter(Boolean).join(': ')));
    if (list.length > shown.length) tx.append(el('div', 'mm-t-line', `And ${list.length - shown.length} more.`));
    t.append(tx);
    const ms = (MOMENT_TUNE.bannerS + MOMENT_TUNE.bannerExtraS * (shown.length - 1)) * 1000;
    t._hold = Date.now() + ms;
    const live = [...box.children].filter(x => !x._gone && !(x._hold > Date.now()));
    const room = box.classList.contains('over-menu') || box.classList.contains('side-dock') || (stageBoxH || $('stageBox').offsetHeight) >= 200 ? 2 : 1;
    const held = [...box.children].filter(x => !x._gone && x._hold > Date.now()).length;
    for (let i = 0; i <= live.length - Math.max(1, room - held); i++) { const o = live[i]; if (!o) break; o._gone = true; clearTimeout(o._timer); o.remove(); }
    box.append(t); u.banner = t;
    t._timer = setTimeout(() => { dropToast(t); if (u.banner === t) u.banner = null; }, ms);
    u.midAt.push(notes.clock);
    emit('momentShow', { tier: 'medium', kind: first.kind, n: list.length, zone: first.zone });
  }
  // Level-ups in a row fold into one ("Level 6", up 3 levels).
  function fold(list) {
    const lv = list.filter(x => x.kind === 'level');
    if (lv.length < 2) return list;
    const last = lv[lv.length - 1];
    return [last].concat(list.filter(x => x.kind !== 'level'));
  }
  function flush() {
    const u = MOMENT_UI, now = Date.now();
    for (let i = MOMENT_Q.length - 1; i >= 0; i--) if (MOMENT_Q[i].kind === 'bark' && now - MOMENT_Q[i].at > 20000) MOMENT_Q.splice(i, 1);   // a bark that missed its moment
    const big = MOMENT_Q.filter(x => x.tier === 'big'), mid = MOMENT_Q.filter(x => x.tier !== 'big');
    if (big.length && !u.ov) {
      const all = withSay(big.concat(fold(mid))); MOMENT_Q.length = 0;   // mediums ride on the big card as lines
      for (const x of mid) MOMENT_UI.midAt.push(notes.clock);   // each folded medium counts against the cap
      showCard(all); return;
    }
    if (big.length) return;   // a big card is up: wait for it
    if (u.ov || (u.banner && u.banner._hold > Date.now())) return;   // a banner keeps its minimum time; a banner under a big card would play unseen
    if (mid.length && midRoom()) { const all = withSay(fold(mid)); MOMENT_Q.length = 0; showBanner(all); }
  }
  // a timer, not onTick: a guide step or a card that holds the game must not hold a moment back
  setInterval(() => {
    const dt = 0.1, u = MOMENT_UI;
    if (!MOMENT_Q.length) { u.wait = 0; u.guideT = 0; return; }
    if (fighting()) { u.wait = 0; return; }
    if (guideBusy() && !fighting()) u.guideT += dt;   // time a guide step has held the queue at fight end
    if (blocked()) { u.wait = 0; return; }
    if ((u.wait += dt) < MOMENT_TUNE.settleS) return;   // the win animation plays out first
    if (u.ov && MOMENT_Q.some(x => x.tier === 'big')) return;
    flush();
  }, 100);
  // checks drive time by hand: a forced flush
  window.__momentFlush = () => { MOMENT_UI.wait = 99; flush(); };

  // ---- the moments ----
  const heroName = id => (typeof ROSTER === 'object' && ROSTER[id] && ROSTER[id].name) || id;
  on('loot', e => {
    const it = e && e.item; if (!it || !it.u || !UNIQ[it.u]) return;
    const u = UNIQ[it.u];
    moment('unique', { title: u.name, sub: e.first ? 'A new unique. It joins your trophy wall.' : 'Another copy of a unique you have.',
      rarity: 'legendary', icon: { item: it }, bark: 'unique',
      lines: e.kept ? [momentWearNote(it)].filter(Boolean) : [{ txt: 'Your bag was full, so it was salvaged.' }], actions: e.kept ? [momentEquipAction(it)].filter(Boolean) : [] });
  });
  on('zoneClear', e => {
    if (!e) return;
    // later zone bosses have their own toast and scroll; a region's last boss has the Great Lantern card, which carries the hero's line
    if (e.zone !== 1) { if (typeof REGIONS === 'object' && !REGIONS.some(r => r.z1 === e.zone)) moment('bark', { bark: 'boss' }); return; }
    moment('boss', { title: 'The first boss falls', sub: `${zoneName(e.zone)} is cleared. The road goes on.`, icon: { ic: ['banner', '#F2C14E'] }, bark: 'boss1' });
  });
  // champion-moment: a Champion's first clear is one big card. Its post scene plays as the story sheet first (the card waits for it, above);
  // the card is the zone's cache (already queued by zoneClear) turned into a Champion card, or its own card when no cache came
  // starters-join-when-met: a starter who joins on this clear (56c's starterJoin, on zoneClear) is a line on the Champion card, first in
  // its list, on every path (its own card, the queued cache, the cache folding in later). With no Champion card (the card or the story
  // off), the kill that follows says it in a toast instead: zoneClear, then the kill, whose story listener raises champWin first.
  let joinPend = null;
  on('starterJoin', e => { joinPend = e && e.ids && e.ids.length ? e : null; });
  const joinLines = z => { const p = joinPend; if (!p || p.zone !== z) return []; joinPend = null; return p.ids.map(id => ({ txt: heroJoinLine(id) })); };
  on('kill', () => { const p = joinPend; if (!p) return; joinPend = null; for (const id of p.ids) emit('toast', { key: 'starterJoin', msg: heroJoinLine(id), kind: 'good', prio: 'high' }); });
  on('champWin', e => {
    if (!e) return;
    const title = e.name ? `${e.name} falls` : 'Champion down', eye = `Zone ${e.zone} Champion down`, joins = MOMENT_OFF ? [] : joinLines(e.zone);   // no cards (a test page): the kill's toast says it
    const q = MOMENT_Q.find(x => (x.kind === 'cache' || x.kind === 'cacheAuto') && x.zone === e.zone);   // the cache may already be queued; else it folds in when it opens (75-caches-ui)
    if (!q) { moment('champion', { title, eye, sub: 'The road goes on.', icon: { ic: ['banner', '#F2C14E'] }, bark: 'boss', zone: e.zone, scene: e.scene, lines: joins }); return; }
    const k = MOMENT_KINDS.champion;
    Object.assign(q, { kind: 'champion', tier: k.tier, eye, snd: k.snd, title, scene: e.scene, lines: joins.concat(q.lines || []) });
  });
  on('heroUnlocked', e => { if (e && e.id) moment('hero', { title: heroName(e.id), sub: 'A new hero will take up the lamp.', icon: { ic: ['banner', '#B58CFF'] } }); });
  // level up is medium only on the first level and every 5th (a banner a level would be a flood); otherwise the toast rules decide
  const MOMENT_LEVEL = L => L === 2 || L % 5 === 0;
  // cal-0107-staged-guide: the card says what the level gave you (attribute points, once the Hero tab is there to spend them)
  const levelSub = () => typeof attrOn === 'function' && attrOn() ? (FEATURE_OF.party && FEATURE_OF.party.when() ? `${HERO_TUNE.perLevel} attribute points to spend on the Hero tab.` : 'You grow stronger.') : `Your hero hits ${Math.round(PACE.heroLv * 100)}% harder.`;
  on('levelup', e => { if (e && !e.quiet && MOMENT_LEVEL(e.L)) moment('level', { title: `Level ${e.L}`, sub: levelSub(), L: e.L, bark: 'level', icon: { ic: ['banner', '#6FCB6A'] } }); });
  on('abilityLearned', e => {
    const a = e && typeof ABILITIES === 'object' && ABILITIES[e.id]; if (!a) return;
    moment('ability', { title: a.name, sub: heroName(e.hero) + ' learns a new ability.', bark: 'ability' });
  });
  on('starFound', e => {
    if (!e || e.quiet || typeof STARS !== 'object' || !STARS[e.id]) return;
    const first = Object.keys((S.stars && S.stars.own) || {}).length <= 1;   // the first Star is a big card (DECISIONS, Early game); later ones are a banner
    moment(first ? 'starFirst' : 'star', { title: STARS[e.id].name, sub: STARS[e.id].text, bark: first ? 'star1' : '' });
  });
  // hero-voice: a boss that beats you (once for each new furthest zone) and the first thing you craft
  on('bossFail', e => { if (e && e.zone >= 1 && typeof voiceLoss === 'function' && voiceSay('loss') && voiceLoss(e.zone)) moment('bark', { bark: 'loss' }); });
  on('crafted', e => { if (e && e.item && typeof voiceOnce === 'function' && voiceSay('craft1') && voiceOnce('craft1')) moment('bark', { bark: 'craft1' }); });
  // a look found: the Deeds grant looks with a Feat, a Group level or a Chapter; compare what is owned
  let ownedLooks = null;
  const lookSet = () => { try { return new Set(deeds.looks().filter(l => l.got).map(l => l.id)); } catch (e) { return null; } };
  const lookCheck = quiet => {
    const now = lookSet(); if (!now) return;
    if (ownedLooks && !quiet) for (const l of deeds.looks()) if (l.got && !ownedLooks.has(l.id)) moment('look', { title: l.n, sub: 'A new look. Wear it from Achievements.', icon: { ic: ['banner', '#B58CFF'] } });
    ownedLooks = now;
  };
  for (const ev of ['deedGroup', 'deedMilestone'])   // a Feat or Chapter card shows its own look on(ev, e => setTimeout(() => lookCheck(!!(e && e.quiet)), 0));
  on('deedsInit', () => { ownedLooks = lookSet(); });
  setTimeout(() => { if (!ownedLooks) ownedLooks = lookSet(); }, 3000);
}
