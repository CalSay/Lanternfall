// 75-caches-ui: the Lantern Cache card (card cache-core). Browser-only; the rules are in 55-caches.js.
// A cache shows through the moment layer (75-moments-ui): a big card, or, once the player is on auto-open, a medium banner unless it
// holds a look or a unique (or is the first Star, or zone 1's first boss). The card lists what the win paid, in the colour of the best
// thing inside. The drops this clear already queued as moments (the unique, the first Star, zone 1's boss card) fold into the cache card.
// This file loads before 75-moments-ui, so the moment layer's names are read inside the handler, never at load.
// boss-spoils-pick (Opus judge 2026-10-08): a zone 6 to 10 first clear that drops a Scroll asks which move it teaches now, when two or more
// moves of the hero in play can be learned with that Scroll. Up to three, in the Abilities list's order, never sorted (the top move is marked: see cache-pick-order-settles below); Keep the
// Scroll (or any other close) keeps it. A pick learns the move and slots it in a free slot, else opens Abilities on it to swap.
// Nothing new is paid. Events for the walk: choice 'spoils' and spoilsPick { zone, offered, taken } (taken: a move id or 'keep').
// loadout-odds (W10): once the zone boss odds are in (56e learnOdds), each pick says what it does to the line ("Zone 11 boss: about 8 in
// 10, now 4"), and a pick goes where that line assumed (abilityPlace). The odds start when the card opens and take a moment: until they
// are in, each move's own line; a sub fills in when its number arrives.
// cache-pick-order-settles: the picks always keep the Abilities list's order, so a card never moves under the pointer (the kill moves
// maxZone, so the odds were almost never in at open, and when they were the order differed). The move that lifts the line most is
// marked in place (.lift) once its number is in. The fill stops when the card closes: no odds work for a pick no one can see.
const SPOILS_TUNE = { from: 6, to: 10, max: 3, waitMs: 300, tries: 100 };
const spoilsOdds = k => { try { const lo = typeof learnOdds === 'function' ? learnOdds(k) : null; return lo && lo.rows.length ? lo : null; } catch (e) { return null; } };
// the sub says where the pick goes when it moves the slots ("In Q, Spark out."), then the line
const spoilsSub = (lo, id) => { const r = lo && lo.rows.find(x => x.id === id); if (!r || !r.lift) return '';
  const nm = x => (ABILITIES[x] || {}).name || x;
  return `In ${'QWE'[r.p]}${r.out ? `, ${nm(r.out)} out` : ''}. Zone ${lo.zone} boss: about ${r.lift.after} in 10, now ${r.lift.before}`; };
function spoilsMoves(v) {
  try {
    if (!v || !v.scroll || !(v.zone >= SPOILS_TUNE.from && v.zone <= SPOILS_TUNE.to) || typeof abLearnInfo !== 'function') return null;
    const k = soloHero(); if (!k || !HERO_ABILITIES[k]) return null;
    let ids = HERO_ABILITIES[k].filter(id => { const i = abLearnInfo(k, id); return i.why === '' && i.payWith === v.scroll.id; });
    return ids.length >= 2 ? { k, ids: ids.slice(0, SPOILS_TUNE.max), lo: spoilsOdds(k), closed: false } : null;
  } catch (e) { return null; }
}
// the offered move that lifts the line most (learnOdds rows are best first), or '' when none lifts it
const spoilsTop = (lo, ids) => { const r = lo && lo.rows.find(x => ids.includes(x.id)); return r && r.lift && r.lift.after > r.lift.before ? r.id : ''; };
// the odds arrive after the card is up: fill each pick's line and mark the top move in place (never reorder under the pointer)
function spoilsFill(sp, n = 0) {
  if (sp.closed || n > SPOILS_TUNE.tries) return;
  const lo = sp.lo || spoilsOdds(sp.k);
  if (!lo) { setTimeout(() => spoilsFill(sp, n + 1), SPOILS_TUNE.waitMs); return; }
  const top = spoilsTop(lo, sp.ids);
  // only this pick's own row (a second pick folded into the card shows no row of its own: it waits for its close)
  const bs = [...document.querySelectorAll('.mm-ov .mm-pick')], nm = b => (b.querySelector('b') || {}).textContent;
  const seen = bs.length === sp.ids.length && sp.ids.every((x, i) => ABILITIES[x].name === nm(bs[i]));
  if (seen) sp.ids.forEach((id, i) => { const sm = bs[i].querySelector('small'), t = spoilsSub(lo, id);
    if (t && sm) sm.textContent = t;
    if (id === top) bs[i].classList.add('lift'); });
  if (!seen) setTimeout(() => spoilsFill(sp, n + 1), SPOILS_TUNE.waitMs);   // the card waits behind another: fill it once it shows
}
function spoilsPicks(v, sp) {
  const sid = v.scroll.id, done = taken => { sp.closed = true; emit('choice', 'spoils'); emit('spoilsPick', { zone: v.zone, offered: sp.ids.length, taken }); };
  const learn = id => {
    const k = sp.k, i = abLearnInfo(k, id);
    if (soloHero() !== k || i.why || i.payWith !== sid) { done('keep'); return; }   // the card waited and the move went: the Scroll stays
    const lo = spoilsOdds(k), row = lo && lo.rows.find(r => r.id === id && r.lift);   // where it goes, read before it is learned
    if (!abilityLearn(k, id)) { done('keep'); return; }
    const free = soloEquipped().indexOf(null), placed = !!row && typeof abilityPlace === 'function' && abilityPlace(k, row);   // in the spot its line said
    if (!placed && free >= 0) soloEquip(free, id);
    else if (!placed) { if (typeof abilityOpenDetail === 'function') abilityOpenDetail(id); setTab('abilities', '#sec-abilities'); }   // all slots full: Abilities, on the move, has "Swap it in for:"
    try { save(); } catch (e) {}
    try { ui(true); } catch (e) {}   // the fight bar shows the slotted move now
    done(id);
  };
  return { pickHead: 'Learn one now:', goTxt: 'Keep the Scroll', onKeep: () => done('keep'),
    picks: sp.ids.map(id => ({ txt: ABILITIES[id].name, sub: spoilsSub(sp.lo, id) || ABILITIES[id].line, fn: () => learn(id) })) };
}
on('cacheOpen', v => {
  if (typeof moment !== 'function') return;
  if (!MOMENT_KINDS.cacheAuto) MOMENT_KINDS.cacheAuto = { tier: 'medium', eye: 'Lantern Cache', col: '#F2C14E', snd: 'mid' };
  const sp = spoilsMoves(v);
  const big = !v.auto || !!v.look || !!v.unique || v.starFirst || v.zone === 1 || !!sp;   // a pick needs the card (zones 6 to 10 only)
  const lines = [];
  // look-card-says-why: the colour's own line says what it did, whatever the sub line shows (the desk player asked what a colour was)
  if (v.look) { const ln = v.look.n.replace(/ lantern$/, '');
    lines.push({ txt: v.look.worn ? `Your lantern burns ${ln} now.` : `New lantern colour: ${ln}. You own it now.`, icon: { ic: ['banner', v.look.col] } }); }
  if (v.unique) {
    lines.push({ txt: `${v.unique.name}. A unique.`, icon: { item: v.unique.item } });
    const wn = typeof momentWearNote === 'function' ? momentWearNote(v.unique.item) : null; if (wn) lines.push(wn);   // Cal's play note 9: say where a unique you cannot wear went
  }
  if (v.star) lines.push({ txt: `Star: ${v.star.name}` });
  if (v.trophy) lines.push({ txt: `${v.trophy.n} ${v.trophy.name}` });
  const pay = [];
  if (v.scroll) pay.push(v.scroll.name);
  if (v.gold) pay.push(`${fmt(v.gold)} gold`);
  if (v.ess && !v.essFull) pay.push(`${v.ess} Essence`);
  if (pay.length) lines.push({ txt: pay.join(', ') });
  if (v.essFull) lines.push({ txt: 'Your Essence store is full, so some or all of this win\'s Essence may be lost. Build more room at the Camp.' });
  // the colour: a unique first, then the lantern colour, then a Star, then a Scroll
  const col = v.unique ? '#FF8A3D' : v.look ? v.look.col : v.star ? '#F2C14E' : v.scroll ? v.scroll.col : '#F2C14E';
  const icon = v.unique ? { item: v.unique.item } : { ic: ['banner', col] };
  const title = v.zone === 1 ? 'First boss down' : `Zone ${v.zone} cleared`;
  // the sub is one short line: the unique's odds (honest, with modifiers); the colour's line says what a look did
  const sub = v.chance !== null && v.chance !== undefined ? `Unique chance on this win: ${v.chance}%.` : 'Here is what the win gave you.';
  const o = { title, sub, col, icon, lines, zone: v.zone };
  if (sp) { Object.assign(o, spoilsPicks(v, sp)); setTimeout(() => spoilsFill(sp), SPOILS_TUNE.waitMs); }
  o.actions = [];
  if (v.unique && typeof momentEquipAction === 'function') { const eq = momentEquipAction(v.unique.item); if (eq) o.actions.push(eq); }   // Cal's play note 9: the unique is one tap from being worn
  if (big && !sp && v.n >= CACHE_TUNE.autoFrom) o.actions.push({ txt: cacheAuto() ? 'Turn off auto-open' : 'Open the next ones automatically', fn: () => cacheSetAuto(!cacheAuto()) });
  const barks = v.zone === 1 ? ['boss1'] : [];
  const ci = MOMENT_Q.findIndex(q => q.kind === 'champion' && q.zone === v.zone);   // champion-moment: a Champion's first clear queued its own card (75-moments-ui)
  if (big || ci >= 0) {
    // fold in what this clear already queued: zone 1's boss card, the unique, the Star
    for (let i = MOMENT_Q.length - 1; i >= 0; i--) {
      const q = MOMENT_Q[i];
      if (q.kind === 'boss' || (q.kind === 'unique' && v.unique && q.title === v.unique.name)
        || ((q.kind === 'starFirst' || q.kind === 'star') && v.star && q.title === v.star.name)) { if (q.bark) barks.push(q.bark); MOMENT_Q.splice(i, 1); }
    }
    // the hero's line for what the card now carries (55-voice): the strongest of the folded moments' barks
    if (barks.length && typeof voicePick === 'function') o.bark = voicePick(barks);
  }
  // the cache folds into that card, so the win is one card
  const cj = ci >= 0 ? MOMENT_Q.findIndex(q => q.kind === 'champion' && q.zone === v.zone) : -1;   // the fold loop above spliced, so ci may be stale
  if (cj >= 0) {
    const c = MOMENT_Q.splice(cj, 1)[0];
    if (c.bark) barks.push(c.bark);
    if (barks.length && typeof voicePick === 'function') o.bark = voicePick(barks);
    moment('champion', Object.assign(o, { title: c.title, eye: c.eye, scene: c.scene, lines: (c.lines || []).concat(o.lines) }));   // the Champion card's own lines (a starter joining) stay on top
    return;
  }
  moment(big ? 'cache' : 'cacheAuto', o);
});
