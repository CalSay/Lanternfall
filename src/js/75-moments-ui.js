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
// the end of the fight (never shown during a turn, so it never covers a parry window) and shows at once outside one. It does
// wait for the guide step on screen, the Away and What's-new cards, and the first seconds after boot.
// Several at fight end fold into one card with a list. Reduced motion: the same card, no burst.
// API for later cards:  moment(kind, { title, sub, rarity, icon, still, lines, actions })
//   kind     'boss' | 'unique' | 'cache' | 'hero' (big); 'level' | 'ability' | 'star' | 'look' | 'craft' (medium)
//   title    the name, one line;  sub  one short line;  rarity  common..legendary (the colour; else the kind's own)
//   icon     an icon spec for iconOf() ({ item }, { mat }, { ic });  still  a data URL (a bigger picture)
//   lines    [{ txt, ic? }] a short list under the title;  actions  [{ txt, fn }] extra buttons beside Continue
// momentState() -> { up, banner, queued } for the checks. Nothing here is saved: a moment not yet seen when the game closes
// is dropped (a unique already sits in the trophy wall).
const MOMENT_TUNE = { bannerS: 2.6, bannerExtraS: 0.7, settleS: 0.6, tapLockMs: 700, maxLines: 5, maxBanner: 3, bootS: 4, guideWaitS: 6, midMax: 2, midWindowS: 180, midFirstS: 1800 };
const MOMENT_KINDS = {
  boss: { tier: 'big', eye: 'Boss down', col: '#F2C14E', snd: 'big' },
  unique: { tier: 'big', eye: 'Unique loot', col: '#FF8A3D', snd: 'big' },
  cache: { tier: 'big', eye: 'Lantern Cache', col: '#F2C14E', snd: 'big' },
  hero: { tier: 'big', eye: 'New hero', col: '#B58CFF', snd: 'big' },
  level: { tier: 'medium', eye: 'Level up', col: '#6FCB6A', snd: 'mid' },
  ability: { tier: 'medium', eye: 'New ability', col: '#5FA8FF', snd: 'mid' },
  star: { tier: 'medium', eye: 'New Star', col: '#F2C14E', snd: 'mid' },
  look: { tier: 'medium', eye: 'Look found', col: '#B58CFF', snd: 'mid' },
  craft: { tier: 'medium', eye: 'Well made', col: '#5FA8FF', snd: 'mid' }
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
  const k = MOMENT_KINDS[kind] || { tier: 'medium', eye: '', col: '#F2C14E', snd: 'mid' };
  MOMENT_Q.push(Object.assign({}, o, { kind, tier: k.tier, eye: o.eye || k.eye, col: (o.rarity && MOMENT_RARITY[o.rarity]) || o.col || k.col, snd: k.snd }));
  MOMENT_UI.wait = 0;
  return true;
}
function momentState() { return { up: !!MOMENT_UI.ov, banner: !!MOMENT_UI.banner, queued: MOMENT_Q.length }; }
{
  const fighting = () => { try { return typeof TURN_LIVE !== 'undefined' && !!TURN_LIVE && !TURN_LIVE.ended; } catch (e) { return false; } };
  const bootT = performance.now();
  // a card up, the guide's step, the What's-new window or the first seconds after boot hold a moment back
  // (the guide's step gets guideWaitS seconds to finish, then the moment shows over it: a step left on screen must not hide a unique)
  const blocked = () => !!document.querySelector('.away-ov, #createScreen, .join-ov, .gl-ov, .dd-fc-ov') || NEWS.open || performance.now() - bootT < MOMENT_TUNE.bootS * 1000
    || (guideBusy() && MOMENT_UI.guideT < MOMENT_TUNE.guideWaitS);
  // medium moments in the first half hour: at most midMax in any midWindowS seconds
  const midRoom = () => {
    const u = MOMENT_UI, now = Date.now();
    u.midAt = u.midAt.filter(t => now - t < MOMENT_TUNE.midWindowS * 1000);
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
    let pic = null; try { pic = first.still || (first.icon && iconOf(first.icon)); } catch (e) {}
    if (pic) { const im = img(pic, 'mm-img'); art.append(im); }
    card.append(art);
    const h = el('h2', 'mm-head', first.title || first.eye); h.id = 'mmHead';
    card.append(h);
    if (first.sub) card.append(el('p', 'mm-sub', first.sub));
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
    emit('momentShow', { tier: 'big', kind: first.kind, n: list.length });
  }
  // The medium banner is a toast in the notices slot, held for bannerS seconds: a later toast cannot retire it (70-ui popToast).
  function showBanner(list) {
    const u = MOMENT_UI, box = $('toasts'); if (!box) return;
    if (u.banner) { dropToast(u.banner); u.banner = null; }
    const shown = list.slice(0, MOMENT_TUNE.maxBanner), first = shown[0];
    let pic = null; try { pic = first.icon && iconOf(first.icon); } catch (e) {}
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
    for (const x of shown.slice(1)) tx.append(el('div', 'mm-t-line', [x.eye, x.title].filter(Boolean).join(': ')));
    if (list.length > shown.length) tx.append(el('div', 'mm-t-line', `And ${list.length - shown.length} more.`));
    t.append(tx);
    const ms = (MOMENT_TUNE.bannerS + MOMENT_TUNE.bannerExtraS * (shown.length - 1)) * 1000;
    t._hold = Date.now() + ms;
    const live = [...box.children].filter(x => !x._gone && !(x._hold > Date.now()));
    const room = box.classList.contains('over-menu') || box.classList.contains('side-dock') || (stageBoxH || $('stageBox').offsetHeight) >= 200 ? 2 : 1;
    for (let i = 0; i <= live.length - room; i++) { const o = live[i]; o._gone = true; clearTimeout(o._timer); o.remove(); }
    box.append(t); u.banner = t;
    t._timer = setTimeout(() => { dropToast(t); if (u.banner === t) u.banner = null; }, ms);
    u.midAt.push(Date.now());
    emit('momentShow', { tier: 'medium', kind: first.kind, n: list.length });
  }
  // Level-ups in a row fold into one ("Level 6", up 3 levels).
  function fold(list) {
    const lv = list.filter(x => x.kind === 'level');
    if (lv.length < 2) return list;
    const last = lv[lv.length - 1];
    return [Object.assign({}, last, { sub: `Up ${lv.length} levels. Your hero hits ${Math.round(PACE.heroLv * 100)}% harder each time.` })].concat(list.filter(x => x.kind !== 'level'));
  }
  function flush() {
    const u = MOMENT_UI;
    const big = MOMENT_Q.filter(x => x.tier === 'big'), mid = MOMENT_Q.filter(x => x.tier !== 'big');
    if (big.length && !u.ov) {
      const all = big.concat(fold(mid)); MOMENT_Q.length = 0;   // mediums ride on the big card as lines
      if (mid.length) MOMENT_UI.midAt.push(Date.now());
      showCard(all); return;
    }
    if (big.length) return;   // a big card is up: wait for it
    if (mid.length && midRoom()) { const all = fold(mid); MOMENT_Q.length = 0; showBanner(all); }
  }
  // a timer, not onTick: a guide step or a card that holds the game must not hold a moment back
  setInterval(() => {
    const dt = 0.2, u = MOMENT_UI;
    if (!MOMENT_Q.length) { u.wait = 0; u.guideT = 0; return; }
    if (fighting()) { u.wait = 0; return; }
    if (guideBusy() && !fighting()) u.guideT += dt;   // time a guide step has held the queue at fight end
    if (blocked()) { u.wait = 0; return; }
    if ((u.wait += dt) < MOMENT_TUNE.settleS) return;   // the win animation plays out first
    if (u.ov && MOMENT_Q.some(x => x.tier === 'big')) return;
    flush();
  }, 200);
  // checks drive time by hand: a forced flush
  window.__momentFlush = () => { MOMENT_UI.wait = 99; flush(); };

  // ---- the moments ----
  const heroName = id => (typeof ROSTER === 'object' && ROSTER[id] && ROSTER[id].name) || id;
  on('loot', e => {
    const it = e && e.item; if (!it || !it.u || !UNIQ[it.u]) return;
    const u = UNIQ[it.u];
    moment('unique', { title: u.name, sub: e.first ? 'A new unique. It joins your trophy wall.' : 'Another copy of a unique you have.',
      rarity: 'legendary', icon: { item: it },
      lines: e.kept ? [] : [{ txt: 'Your bag was full, so it was salvaged.' }] });
  });
  on('zoneClear', e => {
    if (!e || e.zone !== 1) return;   // the first boss: later zone bosses have their own toast, scroll and (every region) Great Lantern
    moment('boss', { title: 'The first boss falls', sub: `${zoneName(e.zone)} is cleared. The road goes on.`, icon: { ic: ['banner', '#F2C14E'] } });
  });
  on('heroUnlocked', e => { if (e && e.id) moment('hero', { title: heroName(e.id), sub: 'A new hero will take up the lamp.', icon: { ic: ['banner', '#B58CFF'] } }); });
  // level up is medium only on the first level and every 5th (a banner a level would be a flood); otherwise the toast rules decide
  const MOMENT_LEVEL = L => L === 2 || L % 5 === 0;
  on('levelup', e => { if (e && !e.quiet && MOMENT_LEVEL(e.L)) moment('level', { title: `Level ${e.L}`, sub: `Your hero hits ${Math.round(PACE.heroLv * 100)}% harder.`, L: e.L, icon: { ic: ['banner', '#6FCB6A'] } }); });
  on('abilityLearned', e => {
    const a = e && typeof ABILITIES === 'object' && ABILITIES[e.id]; if (!a) return;
    moment('ability', { title: a.name, sub: heroName(e.hero) + ' learns a new ability.' });
  });
  on('starFound', e => {
    if (!e || e.quiet || typeof STARS !== 'object' || !STARS[e.id]) return;
    moment('star', { title: STARS[e.id].name, sub: STARS[e.id].text });
  });
  // a look found: the Deeds grant looks with a Feat, a Group level or a Chapter; compare what is owned
  let ownedLooks = null;
  const lookSet = () => { try { return new Set(deeds.looks().filter(l => l.got).map(l => l.id)); } catch (e) { return null; } };
  const lookCheck = quiet => {
    const now = lookSet(); if (!now) return;
    if (ownedLooks && !quiet) for (const l of deeds.looks()) if (l.got && !ownedLooks.has(l.id)) moment('look', { title: l.n, sub: 'A new look. Wear it from Achievements.', icon: { ic: ['banner', '#B58CFF'] } });
    ownedLooks = now;
  };
  for (const ev of ['deedFeat', 'deedGroup', 'deedChapter', 'deedMilestone']) on(ev, e => setTimeout(() => lookCheck(!!(e && e.quiet)), 0));
  on('deedsInit', () => { ownedLooks = lookSet(); });
  setTimeout(() => { if (!ownedLooks) ownedLooks = lookSet(); }, 3000);
}
